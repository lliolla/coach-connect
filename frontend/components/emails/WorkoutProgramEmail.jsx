import { Body, Container, Head, Heading, Html, Preview, Text, Link, Section, Hr, Img } from '@react-email/components';
import * as React from 'react';

export const WorkoutProgramEmail = ({ athleteName, programTitle, notes, exercises = [], mainRounds, duration }) => {
  const sections = {
    'warmup': [],
    'main': [],
    'cooldown': []
  };

  exercises.forEach(ex => {
    if (sections[ex.section]) {
      sections[ex.section].push(ex);
    } else {
      sections['main'].push(ex);
    }
  });

  return (
    <Html>
      <Head />
      <Preview>Ton programme de la semaine est disponible !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Hello {athleteName} ! 👋</Heading>
          <Text style={text}>
            Voici ton nouveau programme pour cette semaine : <strong>{programTitle}</strong>. 
            {duration && <span> Prévois environ <strong>{duration} min</strong> pour cette séance.</span>}
          </Text>
          {notes && (
            <Text style={italicText}>
              " {notes} "
            </Text>
          )}

          {Object.entries(sections).map(([key, list]) => list.length > 0 && (
            <Section key={key} style={sectionContainer}>
              <Heading style={h2}>
                {key === 'warmup' ? 'Échauffement' : 
                 key === 'main' ? `Corps de séance ${mainRounds ? `(${mainRounds} tours)` : ''}` : 
                 key === 'cooldown' ? 'Retour au calme' : 
                 key.charAt(0).toUpperCase() + key.slice(1)}
              </Heading>
              {list.map((ex, i) => (
                <Section key={i} style={exerciseRow}>
                  {ex.exercise?.image_data && (
                    <Img 
                      src={ex.exercise.image_data} 
                      width="50" 
                      height="50" 
                      alt={ex.exercise.name} 
                      style={exerciseImage} 
                    />
                  )}
                  <Text style={exerciseText}>
                    <strong>{ex.exercise?.name}</strong>: {ex.sets}x{ex.reps} {ex.weight ? `(${ex.weight}kg)` : ''} {ex.rest_time ? `| Repos: ${ex.rest_time}s` : ''}
                    {ex.notes && <Text style={noteText}>Note: {ex.notes}</Text>}
                  </Text>
                </Section>
              ))}
            </Section>
          ))}

          <Hr style={hr} />

          <Text style={text}>
            Connecte-toi à l'application pour voir tous les détails et cocher tes exercices.
          </Text>
          <Link href="https://www.prepathlete.pro" style={button}>
            Voir mon programme
          </Link>
        </Container>
      </Body>
    </Html>
  );
};

// Styles simples et robustes pour les boîtes mail
const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px', maxWidth: '560px', borderRadius: '8px', paddingLeft: '24px', paddingRight: '24px' };
const h1 = { color: '#333', fontSize: '24px', fontWeight: 'bold', margin: '40px 0' };
const h2 = { color: '#333', fontSize: '18px', fontWeight: 'bold', margin: '20px 0 10px' };
const text = { color: '#525f7f', fontSize: '16px', lineHeight: '24px', textAlign: 'left' };
const exerciseRow = { display: 'flex', alignItems: 'center', margin: '10px 0' };
const exerciseImage = { borderRadius: '4px', marginRight: '10px' };
const exerciseText = { ...text, margin: '0' };
const noteText = { ...text, fontStyle: 'italic', color: '#718096', fontSize: '14px', marginTop: '4px' };
const italicText = { ...text, fontStyle: 'italic', color: '#718096', borderLeft: '4px solid #e2e8f0', paddingLeft: '12px' };
const button = { backgroundColor: '#000000', borderRadius: '5px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', display: 'block', padding: '12px', marginTop: '24px' };
const sectionContainer = { margin: '20px 0' };
const hr = { borderColor: '#e6ebf1', margin: '20px 0' };
