```javascript
let data = {

    users: [
        {
            uId: 1,
            authUserId: 1,
            nameFirst: 'Lachlan',
            nameLast: 'Gilroy',
            handleStr:  'lachlangilroy',
            email:  'something@gmail.com',
            password: 'notapassword',
        }
    ],
    
    channels: [
        {
			channelId: 1,
			channelName: 'Main',
			channelDescription: 'Main channel for general discussion'
			channelMemberIds: [1, 3, 4, 6],
			channelOwnerIds: [1, 4],
			isPublic: true,
        }
    ]
}
```
[Optional] short description: This structure contains all the data in one big object that contains 2 lists, one for users and one for channels, that can be accessed first before their contents are accessed. Users is an array of user objects with each object containing the features of the user as keys. channels is an array of channel objects with each object ccontaining the features of that channel. This entire structure makes for simple navigation of the database and easy accessing of needed user and channel information. The arrays within the data object allow for expansion of both users and channels to include more users and more channels through using array features such as array.push() and array.sort().
