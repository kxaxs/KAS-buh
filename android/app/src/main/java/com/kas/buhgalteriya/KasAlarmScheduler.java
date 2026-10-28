package com.kas.buhgalteriya;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Single place for exact reminder alarms: set / cancel plus persistence in
 * SharedPreferences, so KasBootReceiver can re-arm them after a device reboot
 * or an app update (AlarmManager drops every alarm in both cases).
 */
public final class KasAlarmScheduler {

    private static final String PREFS_NAME = "kas_alarms";
    private static final String KEY_LIST = "alarms";

    private KasAlarmScheduler() {}

    public static void setAlarm(Context ctx, int id, String title, String body, String saleId, long fireAt) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        PendingIntent pi = buildPendingIntent(ctx, id, title, body, saleId);
        // setAlarmClock fires exactly on time even in Doze (API 21+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            am.setAlarmClock(new AlarmManager.AlarmClockInfo(fireAt, pi), pi);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, fireAt, pi);
        }
    }

    public static void cancelAlarm(Context ctx, int id) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am != null) {
            // Extras are not part of PendingIntent matching — a bare intent cancels it
            am.cancel(buildPendingIntent(ctx, id, null, null, null));
        }
        NotificationManager nm =
            (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.cancel(id);
    }

    private static PendingIntent buildPendingIntent(Context ctx, int id, String title, String body, String saleId) {
        Intent intent = new Intent(ctx, KasAlarmReceiver.class);
        intent.putExtra("id", id);
        if (title != null) intent.putExtra("title", title);
        if (body != null) intent.putExtra("body", body);
        if (saleId != null) intent.putExtra("saleId", saleId);
        return PendingIntent.getBroadcast(
            ctx, id, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    // ---- persistence (JSON array in SharedPreferences, best effort) ----

    public static void saveAlarm(Context ctx, int id, String title, String body, String saleId, long fireAt) {
        try {
            JSONArray next = withoutId(readList(ctx), id);
            JSONObject item = new JSONObject();
            item.put("id", id);
            item.put("title", title == null ? "" : title);
            item.put("body", body == null ? "" : body);
            item.put("saleId", saleId == null ? "" : saleId);
            item.put("fireAt", fireAt);
            next.put(item);
            writeList(ctx, next);
        } catch (Exception e) {
            // persistence is best effort: the alarm itself still works without it
        }
    }

    public static void removeAlarm(Context ctx, int id) {
        try {
            writeList(ctx, withoutId(readList(ctx), id));
        } catch (Exception e) {
            // best effort
        }
    }

    /** Re-arm every stored alarm that is still in the future (boot / app update). */
    public static void restoreAlarms(Context ctx) {
        try {
            JSONArray arr = readList(ctx);
            long now = System.currentTimeMillis();
            JSONArray next = new JSONArray();
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.optJSONObject(i);
                if (o == null) continue;
                long fireAt = o.optLong("fireAt", 0);
                if (fireAt <= now) continue; // already past — drop it
                setAlarm(ctx, o.optInt("id", 0), o.optString("title", ""),
                    o.optString("body", ""), o.optString("saleId", ""), fireAt);
                next.put(o);
            }
            writeList(ctx, next);
        } catch (Exception e) {
            // best effort
        }
    }

    private static JSONArray withoutId(JSONArray arr, int id) {
        JSONArray next = new JSONArray();
        for (int i = 0; i < arr.length(); i++) {
            JSONObject o = arr.optJSONObject(i);
            if (o != null && o.optInt("id", -1) != id) next.put(o);
        }
        return next;
    }

    private static JSONArray readList(Context ctx) {
        String json = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_LIST, "[]");
        try {
            return new JSONArray(json);
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    private static void writeList(Context ctx, JSONArray arr) {
        ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit().putString(KEY_LIST, arr.toString()).apply();
    }
}
