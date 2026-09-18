const { getChannel, connectRabbitMQ } = require("../../config/rabbitmq");
const asciiParser = require("../asciiParser");
// const parserResult = require("../parser");

const ASCII_QUEUE = "ASCII_QUEUE";
async function consumePacket(){
    try{
        await connectRabbitMQ();
           const channel = getChannel();
        await channel.assertQueue(ASCII_QUEUE, { durable: true });
       channel.prefetch(10);
        await channel.consume(ASCII_QUEUE, async(msg) =>{
          if(!msg) return ;
            // console.log("received data:", msg);
                
            const reuslt = await asciiParser(msg.content);
            console.log("show json result", JSON.stringify(reuslt, null, 2));
            
            channel.ack(msg)
  
        });
    
    }
    catch(error){
        console.error(error)
    }
}
consumePacket();