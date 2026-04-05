import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Booking } from '../bookings/schemas/booking.schema';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendBookingConfirmation(booking: Booking): Promise<void> {
    const { client, service, professional, date, time, notes } = booking;

    const [year, month, day] = date.split('-');
    const dateForDisplay = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day)),
    );
    const formattedDate = dateForDisplay.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
    const capitalizedDate =
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    const escape = (str: string) =>
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const notesBlock = notes
      ? `<tr>
          <td style="padding:16px 20px;">
            <span style="color:#6b7280;font-size:13px;">NOTAS</span><br>
            <strong style="color:#1a1a2e;font-size:15px;">${escape(notes)}</strong>
          </td>
        </tr>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background-color:#1a1a2e;padding:32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">BookingApp</h1>
              <p style="color:#a0a0b0;margin:8px 0 0;font-size:13px;">Confirmación de Reserva</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <div style="width:64px;height:64px;background-color:#22c55e;border-radius:50%;margin:0 auto;line-height:64px;">
                <span style="color:white;font-size:36px;line-height:64px;">✓</span>
              </div>
              <h2 style="color:#1a1a2e;margin:16px 0 8px;font-size:20px;">¡Reserva Confirmada!</h2>
              <p style="color:#6b7280;margin:0;font-size:15px;">
                Hola <strong>${escape(client.name)}</strong>, tu cita ha sido registrada exitosamente.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                    <span style="color:#6b7280;font-size:12px;">SERVICIO</span><br>
                    <strong style="color:#1a1a2e;font-size:16px;">${escape(service.name)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                    <span style="color:#6b7280;font-size:12px;">PROFESIONAL</span><br>
                    <strong style="color:#1a1a2e;font-size:16px;">${escape(professional.name)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                    <span style="color:#6b7280;font-size:12px;">FECHA</span><br>
                    <strong style="color:#1a1a2e;font-size:16px;">${escape(capitalizedDate)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                    <span style="color:#6b7280;font-size:12px;">HORA</span><br>
                    <strong style="color:#1a1a2e;font-size:16px;">${escape(time)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;${notesBlock ? 'border-bottom:1px solid #e5e7eb;' : ''}">
                    <span style="color:#6b7280;font-size:12px;">PRECIO</span><br>
                    <strong style="color:#1a1a2e;font-size:16px;">$${service.price.toLocaleString('es-AR')}</strong>
                  </td>
                </tr>
                ${notesBlock}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;text-align:center;">
              <p style="color:#6b7280;font-size:13px;margin:0;">
                Si necesitas cancelar tu cita, hazlo con al menos 5 horas de anticipación.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f9fa;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                BookingApp &middot; Este es un correo automático, por favor no respondas.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await this.mailerService.sendMail({
      to: client.email,
      subject: `Confirmación de reserva — ${service.name}`,
      html,
    });
  }
}
