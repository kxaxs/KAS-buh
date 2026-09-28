package com.kas.buhgalteriya;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "KasNotification")
public class KasNotificationPlugin extends Plugin {

    @PluginMethod
    public void getLastFired(PluginCall call) {
        android.content.SharedPreferences prefs = getContext().getSharedPreferences("kas_prefs", android.content.Context.MODE_PRIVATE);
        long ts = prefs.getLong("last_alarm_fired", 0);
        String body = prefs.getString("last_alarm_body", "");
        int id = prefs.getInt("last_alarm_id", 0);
        String saleId = prefs.getString("last_alarm_sale_id", "");
        JSObject result = new JSObject();
        result.put("ts", ts);
        result.put("body", body);
        result.put("id", id);
        result.put("saleId", saleId);
        call.resolve(result);
    }

    @PluginMethod
    public void clear(PluginCall call) {
        try {
            int id = call.getInt("id", 0);
            android.app.NotificationManager nm =
                (android.app.NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.cancel(id);
            call.resolve();
        } catch (Exception e) {
            call.reject("Clear failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void consumePendingSale(PluginCall call) {
        JSObject result = new JSObject();
        try {
            String saleId = "";
            android.app.Activity activity = getActivity();
            if (activity != null && activity.getIntent() != null) {
                Intent intent = activity.getIntent();
                String extra = intent.getStringExtra("kas_sale_id");
                if (extra != null && !extra.isEmpty()) {
                    saleId = extra;
                    // Read-once: later plain resumes must not reopen the sale
                    intent.removeExtra("kas_sale_id");
                }
            }
            result.put("saleId", saleId);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("consumePendingSale failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void schedule(PluginCall call) {
        try {
            int id = call.getInt("id", 0);
            String title = call.getString("title", "⏰ Напоминание");
            String body = call.getString("body", "");
            String saleId = call.getString("saleId", "");
            long fireAt = call.getLong("fireAt", 0L);

            if (fireAt <= 0 || fireAt <= System.currentTimeMillis()) {
                call.reject("Invalid fireAt time");
                return;
            }

            Context ctx = getContext();
            Intent intent = new Intent(ctx, KasAlarmReceiver.class);
            intent.putExtra("id", id);
            intent.putExtra("title", title);
            intent.putExtra("body", body);
            intent.putExtra("saleId", saleId);

            PendingIntent pi = PendingIntent.getBroadcast(
                ctx, id, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am == null) {
                call.reject("AlarmManager not available");
                return;
            }

            // Use AlarmClock for exact timing even in Doze mode
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                // setAlarmClock fires exactly on time even in Doze
                AlarmManager.AlarmClockInfo alarmInfo = new AlarmManager.AlarmClockInfo(fireAt, pi);
                am.setAlarmClock(alarmInfo, pi);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireAt, pi);
            } else {
                am.setExact(AlarmManager.RTC_WAKEUP, fireAt, pi);
            }

            JSObject result = new JSObject();
            result.put("id", id);
            call.resolve(result);

        } catch (Exception e) {
            call.reject("Schedule failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        try {
            int id = call.getInt("id", 0);
            Context ctx = getContext();
            Intent intent = new Intent(ctx, KasAlarmReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(
                ctx, id, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am != null) am.cancel(pi);
            // Also dismiss a visible notification with this id, if any
            android.app.NotificationManager nm =
                (android.app.NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.cancel(id);
            call.resolve();
        } catch (Exception e) {
            call.reject("Cancel failed: " + e.getMessage());
        }
    }
}
