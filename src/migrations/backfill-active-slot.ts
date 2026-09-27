/**
 * Backfill de `activeSlot` para reservas creadas antes del índice único
 * `uniq_active_slot`. Idempotente: se puede correr varias veces.
 *
 * Uso: MONGO_URI=... npm run migrate:active-slot
 *      MONGO_URI=... npm run migrate:active-slot -- --dry-run
 *
 * Si ya existen dobles reservas activas, el índice rechaza la segunda: el
 * script las lista (no las modifica) para resolverlas a mano (cancelar una).
 */
import mongoose from 'mongoose';
import { BookingSchema } from '../bookings/schemas/booking.schema';
import {
  buildActiveSlot,
  isDuplicateKeyError,
} from '../bookings/domain/booking-slot';

async function main(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI es requerido');
  }
  const dryRun = process.argv.includes('--dry-run');

  await mongoose.connect(uri);
  const Booking = mongoose.model('Booking', BookingSchema);
  // createIndexes (no syncIndexes): solo crea, nunca borra índices ajenos.
  if (!dryRun) {
    await Booking.createIndexes();
  }

  const cursor = Booking.find({ activeSlot: { $exists: false } })
    .lean()
    .cursor();

  let updated = 0;
  let skipped = 0;
  const conflicts: { id: string; slot: string }[] = [];

  for await (const booking of cursor) {
    const slot = buildActiveSlot(booking);
    if (!slot) {
      skipped++;
      continue;
    }
    if (dryRun) {
      const taken = await Booking.exists({ activeSlot: slot });
      if (taken) conflicts.push({ id: String(booking._id), slot });
      else updated++;
      continue;
    }
    try {
      // updateOne directo: no dispara hooks ni toca updatedAt.
      await Booking.collection.updateOne(
        { _id: booking._id as mongoose.Types.ObjectId },
        { $set: { activeSlot: slot } },
      );
      updated++;
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      conflicts.push({ id: String(booking._id), slot });
    }
  }

  console.log(JSON.stringify({ dryRun, updated, skipped, conflicts }, null, 2));
  await mongoose.disconnect();
  if (conflicts.length > 0) {
    process.exitCode = 2;
  }
}

main().catch(async (error) => {
  console.error('Backfill de activeSlot falló:', error);
  await mongoose.disconnect();
  process.exit(1);
});
