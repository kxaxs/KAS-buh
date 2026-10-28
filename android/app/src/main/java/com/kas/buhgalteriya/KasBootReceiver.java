package com.kas.buhgalteriya;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * The system drops all AlarmManager alarms on device reboot and on app
 * update. This receiver re-arms the persisted reminder alarms (see
 * KasAlarmScheduler.saveAlarm). The JS side also re-schedules whenever the
 * app is opened, so this only matters for reminders that must fire while
 * the app is closed after a reboot.
 */
public class KasBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent == null ? null : intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) {
            KasAlarmScheduler.restoreAlarms(context);
        }
    }
}
