import axios from "axios";

const ACTIVATION_STATE_ENDPOINT =
  "http://localhost:8080/system/activation-state";

export async function setActivationFlag() {
  try {
    await axios.post(ACTIVATION_STATE_ENDPOINT, {
      activated: true,
      timestamp: Date.now(),
      reason: "Governance Document #84 activated and all subsystems online",
    });

    console.log("🔥 Beast System 3.0 ACTIVATION FLAG SET");
  } catch (err) {
    console.error("Activation flag failed:", err);
  }
}

async function run() {
  console.log("⚡ Setting Beast System 3.0 Activation Flag...");
  await setActivationFlag();
}

run();
