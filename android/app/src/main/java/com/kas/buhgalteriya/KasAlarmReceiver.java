package com.kas.buhgalteriya;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class KasAlarmReceiver extends BroadcastReceiver {
    // Action of the follow-up alarm that force-dismisses the notification.
    public static final String ACTION_CANCEL = "com.kas.buhgalteriya.action.CANCEL_NOTIFICATION";
    // The notification auto-dismisses this long after it fires.
    private static final long AUTO_DISMISS_MS = 10_000;

    @Override
    public void onReceive(Context context, Intent intent) {
        int id = intent.getIntExtra("id", 0);

        // Follow-up alarm: remove the notification even when setTimeoutAfter
        // is ignored (Android < 8.0 or OEM skins).
        if (ACTION_CANCEL.equals(intent.getAction())) {
            NotificationManager nmCancel =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nmCancel != null) nmCancel.cancel(id);
            return;
        }

        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        String saleId = intent.getStringExtra("saleId");

        if (title == null) title = "⏰ Напоминание";
        if (body == null) body = "Напоминание о чеке";

        // Log that receiver fired
        android.content.SharedPreferences prefs = context.getSharedPreferences("kas_prefs", Context.MODE_PRIVATE);
        prefs.edit()
            .putLong("last_alarm_fired", System.currentTimeMillis())
            .putString("last_alarm_body", body)
            .putInt("last_alarm_id", id)
            .putString("last_alarm_sale_id", saleId == null ? "" : saleId)
            .apply();

        // Intent to open app when notification tapped
        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context, id, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // No full-screen intent on purpose: with it the heads-up banner
        // behaves like an incoming alarm call and stays on screen until
        // dismissed manually. A regular high-priority notification shows the
        // same heads-up, but collapses on its own.
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, "default")
            .setSmallIcon(context.getApplicationInfo().icon)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setDefaults(Notification.DEFAULT_ALL)
            .setTimeoutAfter(AUTO_DISMISS_MS);

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.notify(id, builder.build());
        }

        scheduleAutoCancel(context, id);
    }

    // Second alarm AUTO_DISMISS_MS in the future that cancels the notification.
    // Works on every Android version, unlike setTimeoutAfter (API 26+ only).
    private void scheduleAutoCancel(Context context, int id) {
        try {
            Intent cancelIntent = new Intent(context, KasAlarmReceiver.class);
            cancelIntent.setAction(ACTION_CANCEL);
            cancelIntent.putExtra("id", id);
            // requestCode must differ from the reminder PendingIntent (id),
            // otherwise they would replace each other.
            PendingIntent cancelPi = PendingIntent.getBroadcast(
                context, id + 1000000, cancelIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            long cancelAt = System.currentTimeMillis() + AUTO_DISMISS_MS;
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cancelAt, cancelPi);
                } else {
                    am.setExact(AlarmManager.RTC_WAKEUP, cancelAt, cancelPi);
                }
            } catch (SecurityException e) {
                // Exact-alarm permission denied — inexact is fine for cleanup.
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cancelAt, cancelPi);
            }
        } catch (Exception e) {
            // Best effort only — setTimeoutAfter still applies on API 26+.
        }
    }
}
