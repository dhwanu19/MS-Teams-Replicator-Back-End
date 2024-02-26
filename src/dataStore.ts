// YOU SHOULD MODIFY THIS OBJECT BELOW
interface Data {
  users: any[];
  channels: any[];
  dms: any[];
}

let data: Data = {
  users: [

  ],
  channels: [

  ],
  dms: [

  ],
};

/*
Sessions Structure:
[
  {
    authUserId: number,
    token: string
  },
]
*/

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
let store = getData()
console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

names = store.names

names.pop()
names.push('Jake')

console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: Data) {
  data = newData;
}

export { getData, setData };

/* dms structure
  dms: [
    {
      dmId: dmId,
      name: 'ahandle1, bhandle2, chandle3',
      creator: authUserId,
      members: [
        {
          uId: uId,
          email: email,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: handleStr,
        },
      ],
      messages: [
        {
          messageId: messageId,
          uId: uId,
          message: message,
          timeSent: timeSent,
        }
      ],
    },
  ]
*/
