const { MongoClient } = require('mongodb');
require('dotenv').config();

async function check() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/booking-app');
  await client.connect();
  console.log('✅ Conectado a MongoDB');
  
  const db = client.db();
  const bookings = await db.collection('bookings').find().limit(2).toArray();
  
  console.log('\n📊 Primeras 2 reservas:');
  bookings.forEach((booking, i) => {
    console.log(`\n--- Reserva ${i + 1} ---`);
    console.log('Cliente:', booking.client?.name);
    console.log('Servicio:', booking.service?.name);
    console.log('Tiene barber:', !!booking.barber);
    console.log('Tiene professional:', !!booking.professional);
    if (booking.barber) console.log('Barber:', booking.barber);
    if (booking.professional) console.log('Professional:', booking.professional);
  });
  
  await client.close();
}

check().catch(console.error);
