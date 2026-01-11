export function checkEnvFile() {
  console.log('Checking env file...');
  const mandatoryVar = [
    "MONGO_INITDB_ROOT_USERNAME",
    "MONGO_INITDB_ROOT_PASSWORD",
    "MONGO_INITDB_DATABASE",
    "MONGO_HOSTNAME",
  ];
  const missingEnvVariables = mandatoryVar.filter(envVar => {
    const value = process.env[envVar];
    return !value || value.trim() === "";
  });
  if (missingEnvVariables.length > 0) throw new Error(`The next .env variables are missing: ${missingEnvVariables.join(', ')}`);
  else console.log('env file is ok');
}