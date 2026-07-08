async function test() {
  const url = 'https://temvfvyvtklwjlhjcill.supabase.co/auth/v1/health';
  console.log(`Testing ${url} using global fetch...`);
  try {
    const start = Date.now();
    const res = await fetch(url);
    const end = Date.now();
    console.log(`Status: ${res.status}`);
    console.log(`Time: ${end - start}ms`);
  } catch (err) {
    console.error('Fetch error:');
    console.error(err);
  }
}

test();
