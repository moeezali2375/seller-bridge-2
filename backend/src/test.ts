import { sendVerificationEmail } from "./services/email-service";

async function main() {
  try {
    const res = await sendVerificationEmail(
      "moeezali2375@gmail.com",
      "Moeez Ali",
      "123456",
    );
    console.log(res);
  } catch (error) {
    console.error(error);
  }
}

main();
