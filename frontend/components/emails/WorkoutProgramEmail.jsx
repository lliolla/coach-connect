import { Body, Container, Head, Heading, Html, Preview, Text, Link } from '@react-email/components';
import * as React from 'react';

export const WorkoutProgramEmail = ({ athleteName, programTitle, notes }) => (
  <Html>
    <Head />
    <Preview>Ton programme de la semaine est disponible !</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hello {athleteName} ! 👋</Heading>
        <Text style={text}>
          Voici ton nouveau programme pour cette semaine : **{programTitle}**.
        </Text>
        {notes && (
          <Text style={italicText}>
            " {notes} "
          </Text>
        )}
        <Text style={text}>
          Connecte-toi à l'application pour voir les détails de tes séances et cocher tes exercices.
        </Text>
        <Link href="https://votre-app.vercel.app" style={button}>
          Voir mon programme
        </Link>
      </Container>
    </Body>
  </Html>
);

// Styles simples et robustes pour les boîtes mail
const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px', maxWidth: '560px', borderRadius: '8px', paddingLeft: '24px', paddingRight: '24px' };
const h1 = { color: '#333', fontSize: '24px', fontWeight: 'bold', margin: '40px 0' };
const text = { color: '#525f7f', fontSize: '16px', lineHeight: '24px', textAlign: 'left' };
const italicText = { ...text, fontStyle: 'italic', color: '#718096', borderLeft: '4px solid #e2e8f0', paddingLeft: '12px' };
const button = { backgroundColor: '#000000', borderRadius: '5px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', display: 'block', padding: '12px', marginTop: '24px' };