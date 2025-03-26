import {
  findUserByEmail,
  getUserVerificationDetails,
} from "./services/auth-service";

async function main() {
  // registerBuyer("Moeez Test", "moeez@example.com", "1234")
  //   .then((data) => console.log(data))
  //   .catch((err) => console.error(err));

  // const res = await findUserByEmail("moeez@example.com");
  // console.log(res);
  const res = await getUserVerificationDetails(15);
  console.log(res);
}

main();
