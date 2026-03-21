import fs from 'fs';

const keyContent = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDGXbjtKLCWLBqC\n7dENE4Rhgsttr0pLt/SPwkoAcKI6MbHpDEiwm8tmVy/LiqsuGKKOpe/zx6OnuNay\n4FXiSVsEUPaT2YmGES256lSlWl2Qs+Tog7rZ0VYl+aKAJwZWqRkWqBl4JF6Cpo4R\nXHpPPbzARwgEQWu8rI9MqhTg55R/euJIout+AGYRbb/k28OBoHI8ezCUuDqo520W\nsW0DVKB0j+d2DasMC3iHMf3qUQaPpjazA7tMPWpHM3QMSgDsybAXeOYKVCXuJ36k\n/JdYU+0j3r4eUOMTWcmMh6zEV6LZdE5NtcuFHPer304mTwLN+AU0ZbjmnJaMU1TH\nfe5kUpMLAgMBAAECggEATd0qIsWPE1N6kJxDK+vWUeRib8qX0kMCF4//Nk8ADvHE\n0SLGQbTV0XU1yKLE8NIwtOfD2aAqyEJQ3GQcsjdzJ62ULJL+XYbOuSSXV1SyV4OV\nvgM/TBLUyxFDTSSEY2368B7J6JP2GTjBmWUAiaxFNABt0CXR4Xymv0Qf7+xXKPZl\nhMCZ8+GO2MaDkIM87ASLoGwgubkqcdWGw/Uj8cMU/szWB7sAd3VjOADaN4ArdRp5\nwadwfcr/fgtf4bLp/hZPEmtcvr6igb8i2qIgPOulu1bJgW5N0sE37D+I7CT0V7nD\nF69DSmRasMw1i2GyhhxfxAvvroiSKtaEYzQ5j7xXoQKBgQDhrPytMPOZKN3hVfGd\nDKyQkJxGSTEgkpAb82ri0ieSf3kOuYMBJreXJoMZo8Gs+EhOMQ+lrFyaLMYNr9IJ\njTPv/idjkLhx1A5OCs8L2dCPFi9ljxoZPXM7yzhO4IgvuDtoS8WC0CASPXCvmo7e\ngu4LkkUMW3p1dlJUnwGL+OKcUQKBgQDhBU/wDuX7kTmOsqwKBeuORNik9ID10HuD\nounLLP8DAxKZXDtKDJjtLRgnz/SJS61U8mR5Z619mwpp9n+hyAMVvlGCDlaUGrgM\nVOgGkBQaqaNlVboD3yAJSYpOqE/lzZRiMlvPKfXUc+gIdntjb8zsqZWOVhb8lIJl\nhBo3VJmOmwKBgHuQ6Fk8MGVwRu0WzdCcG/Cb/bVOZiPbnCRxx9iiESDZw0MYuG5s\n8KFGaQok6+r1l0GZA2RHV/zi/x6HYo3wTrvdgVu25gcNgTeiG3P1s4hlMVZ+YF/p\karvvskRj//w9DZLJr5VjvntwkGkcw3KyuRzFnOJsyeVvcavuX0WrZ3BAoGBAMVB\n7eiIdu3ISkegs5X5yJwoGC7KtD5I6+3io8bbhBW03NoZ81OfpXPNIy7Laxfsgl9E\nOfX/gCPrBP8M+qfs+V9XPoafYSBmJ8+PovMV3Lne2gEcXHvGXoQltpvrilbul9RZ\nRwhdRUZf8RlyHAp4WJFivFtRdscmvQSXAJBellpfAoGBAJ8kJEusO8YpNoGQKD0X\n6xPEcGGtmCnfbxUkF3jaCi1Tt6Hm9/mGONyzPfwkeafTeOf3wxh5ePiCOxDkY7P0\n/habGD4a9NbDqNiVAOZc8tEFVIzNPo8VzRlKyTHLJn6U4Ns5nr9ZodieSkizF++z\nRWq8zSfUVvX6KZzn2vENGG2+\n-----END PRIVATE KEY-----\n";

const data = {
  type: "service_account",
  project_id: "barberlinkshop",
  private_key_id: "42cb81b4841a1eb990c780e53f679c250ed4dfc1",
  private_key: keyContent,
  client_email: "firebase-adminsdk-fbsvc@barberlinkshop.iam.gserviceaccount.com",
  client_id: "103121915934866877895",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40barberlinkshop.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

fs.writeFileSync('serviceAccountKey.json', JSON.stringify(data, null, 2));
console.log('✅ serviceAccountKey.json written correctly.');
