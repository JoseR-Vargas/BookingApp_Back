import { connect, connection } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    // Conectar a MongoDB
    await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booking-app');
    console.log('✅ Conectado a MongoDB');

    const db = connection.db;
    const bookingsCollection = db.collection('bookings');

    // Buscar todas las reservas que tienen 'barber' en lugar de 'professional'
    const bookingsWithBarber = await bookingsCollection.find({ barber: { $exists: true } }).toArray();
    
    console.log(`📊 Encontradas ${bookingsWithBarber.length} reservas con campo 'barber'`);

    if (bookingsWithBarber.length === 0) {
      console.log('✅ No hay reservas para migrar');
      process.exit(0);
    }

    // Migrar cada reserva
    let migratedCount = 0;
    for (const booking of bookingsWithBarber) {
      // Renombrar 'barber' a 'professional'
      await bookingsCollection.updateOne(
        { _id: booking._id },
        {
          $set: { professional: booking.barber },
          $unset: { barber: '' }
        }
      );
      migratedCount++;
      console.log(`✅ Migrada reserva ${booking._id}: ${booking.barber.name} → professional`);
    }

    console.log(`\n🎉 Migración completada: ${migratedCount} reservas actualizadas`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

migrate();
