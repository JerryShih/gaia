/* global require, marionette, setup, suite, test, __dirname */
'use strict';

var assert = require('chai').assert;

var Messages = require('./lib/messages.js');
var UtilityTray = require('../../../system/test/marionette/lib/utility_tray');
var NotificationList = require(
  '../../../system/test/marionette/lib/notification.js'
).NotificationList;

marionette('Message notification tests', function() {
  var client = marionette.client();

  var messagesApp, notificationList, utilityTray;

  function assertIsNotFocused(element, message) {
    assert.isTrue(element.scriptWith(function(el) {
      return document.activeElement !== el;
    }), message);
  }

  setup(function() {
    messagesApp = Messages.create(client);
    notificationList = new NotificationList(client);
    utilityTray = new UtilityTray(client);

    client.contentScript.inject(
      __dirname + '/mocks/mock_test_storages.js'
    );
    client.contentScript.inject(
      __dirname + '/mocks/mock_navigator_moz_icc_manager.js'
    );
    client.contentScript.inject(
      __dirname + '/mocks/mock_navigator_moz_mobile_message.js'
    );
  });

  suite('Run application via notification', function() {
    var smsMessage, storage;

    function assertMessagesIsInCorrectState() {
      // Verify that we entered the right thread
      var message = messagesApp.Conversation.message;
      assert.equal(
        messagesApp.Conversation.getMessageContent(message).text(),
        smsMessage.body
      );

      assert.isFalse(messagesApp.Composer.sendButton.enabled());

      // Validate that header is correctly set even that thread list hasn't
      // been loaded yet.
      assert.equal(
        messagesApp.Conversation.headerTitle.text(), smsMessage.sender
      );

      // When we open thread from notification, message input should not be
      // focused.
      assertIsNotFocused(
        messagesApp.Composer.messageInput, 'Message input should not be focused'
      );
    }

    setup(function() {
      smsMessage = {
        id: 1,
        iccId: null,
        threadId: 1,
        sender: '+100',
        receiver: null,
        type: 'sms',
        delivery: 'received',
        body: 'Workload message',
        timestamp: Date.now()
      };

      storage = [{
        id: smsMessage.threadId,
        body: smsMessage.body,
        lastMessageType: smsMessage.type,
        timestamp: smsMessage.timestamp,
        messages: [smsMessage],
        participants: [smsMessage.sender]
      }];
    });

    test('when "notification" system message is generated', function() {
      // Receive 'notification' system message and fill up the storage.
      messagesApp.sendSystemMessage('notification', {
        clicked: true,
        data: { threadId: smsMessage.threadId, id: smsMessage.id }
      });
      messagesApp.switchTo();
      messagesApp.setStorage(storage);

      assertMessagesIsInCorrectState();
    });

    test('when user taps on notification in Utility tray', function() {
      // Receive 'sms-received' system message and generate notification.
      messagesApp.sendSystemMessage('sms-received', smsMessage);
      // We should make Messages app visible, otherwise switchToApp won't work.
      messagesApp.launch();
      messagesApp.setStorage(storage);

      // Switch to system app to be sure that notification is generated.
      client.switchToFrame();
      notificationList.waitForNotificationCount(1);

      // Close Message app since we want to run fresh instance.
      messagesApp.close();

      // Show utility tray.
      utilityTray.open();
      utilityTray.waitForOpened();

      // Make sure we have our notification to click and tap on it.
      notificationList.refresh();
      notificationList.tap(
        notificationList.getForApp(messagesApp.manifestURL)[0]
      );

      // Wait for Message app to run and set correct storage.
      messagesApp.switchTo();
      messagesApp.setStorage(storage);

      assertMessagesIsInCorrectState();
    });
  });
});
