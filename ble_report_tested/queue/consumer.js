const { getChannel, connectRabbitMQ } = require("../../config/rabbitmq");
const parserResult = require("../parser");

const HEX_QUEUE = "hex_data_Queue";
async function consumePacket(){
    try{
        await connectRabbitMQ();
           const channel = getChannel();
        await channel.assertQueue(HEX_QUEUE, { durable: true });
       channel.prefetch(10);
        await channel.consume(HEX_QUEUE, async(msg) =>{
          if(!msg) return ;
            // console.log("received data:", msg.content);
                
            const reuslt = parserResult(msg.content);
            console.log("show json result", JSON.stringify(reuslt, null, 2));
            
            channel.ack(msg)
  
        });
    
    }
    catch(error){
        console.error(error)
    }
}
consumePacket();