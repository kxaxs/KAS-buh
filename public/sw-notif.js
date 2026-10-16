/* Обработчик клика по уведомлению PWA.
 * Уведомление показывает service worker (showNotification в useReminders),
 * но без обработчика notificationclick браузер не закрывает его при клике
 * и не открывает приложение. Этот скрипт подключается в генерируемый sw.js
 * через importScripts (см. vite.config.ts).
 */
(function () {
  'use strict';

  function handleNotificationClick(event) {
    // 1) закрыть уведомление сразу
    try { event.notification.close(); } catch (e) {}

    // 2) сфокусировать окно приложения (или открыть, если закрыто)
    event.waitUntil(
      (async function () {
        try {
          var clientList = await self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
          });
          for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if ('focus' in client) {
              try {
                await client.focus();
                return;
              } catch (e) {
                // нет активации пользователя (не должно случаться при
                // настоящем клике) — попробуем следующее окно
              }
            }
          }
          try {
            await self.clients.openWindow('./');
          } catch (e) {}
        } catch (e) {}
      })()
    );
  }

  self.__kasNotificationClick = handleNotificationClick;
  self.addEventListener('notificationclick', handleNotificationClick);
})();
