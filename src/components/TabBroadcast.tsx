// import { useEffect, useState } from 'react';
// import { useBroadcastChannel } from 'use-broadcast-channel';


// const useBroadcastChannel = (channelName) => {
//   const [isDuplicate, setIsDuplicate] = useState(false);
//   const channel = new BroadcastChannel(channelName);

//   useEffect(() => {
//     channel.onmessage = (event) => {
//       if (event.data === 'tab-opened') {
//         setIsDuplicate(true);
//       }
//     };

//     channel.postMessage('tab-opened');

//     return () => {
//       channel.close();
//     };
//   }, [channelName]);

//   return { isDuplicate };
// };

// const TabComponent = () => {
//   const { isDuplicate } = useBroadcastChannel('my-channel');

//   if (isDuplicate) {
//     // Handle duplicate tab logic here
//     return <div>Duplicate tab detected.</div>;
//   }

//   return (
//     <div>
//       {/* Your content here */}
//     </div>
//   );
// };

// export default TabComponent;