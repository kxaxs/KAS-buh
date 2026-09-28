package com.kas.buhgalteriya;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(KasNotificationPlugin.class);
        super.onCreate(savedInstanceState);
        createNotificationChannel();
        requestBatteryOptimizationExemption();
        requestExactAlarmPermissionOnce();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // BridgeActivity does not call setIntent, so do it here: the plugin
        // reads "kas_sale_id" from getIntent() when the app is resumed by a
        // notification tap while it was already in memory.
        setIntent(intent);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            // Only create if doesn't exist - don't delete user settings
            if (manager.getNotificationChannel("default") == null) {
                NotificationChannel channel = new NotificationChannel(
                    "default",
                    "KAS Напоминания",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Напоминания о предстоящих чеках");
                channel.enableVibration(true);
                channel.setShowBadge(true);
                channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
                channel.enableLights(true);
                channel.setBypassDnd(true);
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            android.os.PowerManager pm = (android.os.PowerManager) getSystemService(POWER_SERVICE);
            if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {
                try {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + getPackageName()));
                    startActivity(intent);
                } catch (Exception e) {
                    // ignore
                }
            }
        }
    }

    private void requestExactAlarmPermissionOnce() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Show exact alarm settings page on first launch
            SharedPreferences prefs = getSharedPreferences("kas_prefs", MODE_PRIVATE);
            boolean shown = prefs.getBoolean("exact_alarm_shown", false);

            AlarmManager alarmManager = (AlarmManager) getSystemService(ALARM_SERVICE);
            boolean canSchedule = alarmManager != null && alarmManager.canScheduleExactAlarms();

            if (!canSchedule || !shown) {
                prefs.edit().putBoolean("exact_alarm_shown", true).apply();
                try {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                    intent.setData(Uri.parse("package:" + getPackageName()));
                    startActivity(intent);
                } catch (Exception e) {
                    // ignore
                }
            }
        }
    }
}
