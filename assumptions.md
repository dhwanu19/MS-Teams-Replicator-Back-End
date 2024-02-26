Assumption 1:
ChannelsList returns an empty array if user is not in any channels.

Assumption 2:
Users do not need to be logged in, only registered.

Assumption 3:
Emails used to register are case-sensitive.

Assumption 4:
Arrays of messages have the most recent message at index 0.

Assumption 5:
All names can contain non-alphanumeric characters.

Assumption 6:
Arrays of multiple objects are returned as a set (no order).

Other assumptions:
//We are making the assumption that when channelMessagesV1 accesses the messages array within the messages key of a channel object, that the most recent message is in index 0 and each previous message is in each incremented index of the messages array of objects.
