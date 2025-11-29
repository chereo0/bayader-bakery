// Test the full getProducts API response structure

async function testFrontendAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/products?limit=1000', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📊 HTTP Response Status:', response.status);
    console.log('📋 Headers:');
    console.log('  Content-Type:', response.headers.get('content-type'));
    console.log('  Content-Length:', response.headers.get('content-length'));

    const data = await response.json();

    console.log('\n✅ Full Response JSON:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n🔍 Response Structure Analysis:');
    console.log('  data.success:', data.success);
    console.log('  data.data exists:', !!data.data);
    console.log('  data.data.products exists:', !!data.data?.products);
    console.log('  data.data.products is array:', Array.isArray(data.data?.products));
    console.log('  data.data.products.length:', data.data?.products?.length);
    
    if (data.data?.products && data.data.products.length > 0) {
      console.log('\n📦 First Product Structure:');
      console.log(JSON.stringify(data.data.products[0], null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testFrontendAPI();
