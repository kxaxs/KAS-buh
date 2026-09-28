package com.kas.buhgalteriya;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.core.app.NotificationCompat;

public class KasAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        int id = intent.getIntExtra("id", 0);

        // Legacy (v2.0.25) auto-dismiss alarm: cancel quietly, post nothing.
        // Newer versions no longer schedule these, but alarms survive app
        // updates, so handle any stragglers gracefully.
        if ("com.kas.buhgalteriya.action.CANCEL_NOTIFICATION".equals(intent.getAction())) {
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

        // Regular high-priority notification:
        // - the heads-up banner collapses into the status bar on its own
        //   (no full-screen intent — that made the banner stick on screen);
        // - the notification itself stays in the shade until the user taps it
        //   (autoCancel opens the app and removes it) or swipes it away
        //   (no timeoutAfter — that deleted it entirely).
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, "default")
            .setSmallIcon(context.getApplicationInfo().icon)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setDefaults(Notification.DEFAULT_ALL);

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.notify(id, builder.build());
        }
    }
}
