package com.kas.buhgalteriya;

import android.content.Context;
import android.content.Intent;
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
            KasAlarmScheduler.setAlarm(ctx, id, title, body, saleId, fireAt);
            // Persist so KasBootReceiver can re-arm it after reboot / app update
            KasAlarmScheduler.saveAlarm(ctx, id, title, body, saleId, fireAt);

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
            // Also dismisses a visible notification with this id, if any
            KasAlarmScheduler.cancelAlarm(ctx, id);
            KasAlarmScheduler.removeAlarm(ctx, id);
            call.resolve();
        } catch (Exception e) {
            call.reject("Cancel failed: " + e.getMessage());
        }
    }
}
