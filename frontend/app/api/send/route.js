import { Resend } from 'resend';
import { WorkoutProgramEmail } from '@/components/emails/WorkoutProgramEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, athleteName, programTitle, notes } = body;

    const { data, error } = await resend.emails.send({
      from: 'Prep Athlete <onboarding@resend.dev>',
      to: [to],
      subject: 'Ton programme de la semaine est disponible !',
      react: WorkoutProgramEmail({ athleteName, programTitle, notes }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
