import { StatsigClient } from "@statsig/js-client";
import { StatsigProvider, useFeatureGate } from "@statsig/react-bindings";
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const original = window.fetch;
window.fetch = async (url, data) => {
  await new Promise((r) => setTimeout(r, 1000)); // fake network delay
  return original(url, data);
};

function Content() {
  const gate = useFeatureGate("a_gate");

  return (
    <div>
      a_gate: {String(gate.value)} ({gate.details.reason})
    </div>
  );
}

function App() {
  const [states, setStates] = useState([]);

  const client = useMemo(() => {
    const inst = new StatsigClient(
      "client-rfLvYGag3eyU0jYW5zcIJTQip7GXxSrhOFN69IGMjvq",
      {}
    );

    inst.on("values_updated", (event) => {
      setStates((old) => [...old, event.status]);
    });

    inst.initializeSync();
    return inst;
  }, []);

  useEffect(() => {
    const newUser = { userID: "b_user" };

    // (Optional) If you need to immediately switch without latest values
    // client.updateUserSync(newUser);

    client.dataAdapter
      .prefetchData(newUser)
      .then(() => client.updateUserSync({ userID: "b_user" }));
  }, [client]);

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <StatsigProvider client={client}>
        <>{JSON.stringify(states)}</>
        <Content />
      </StatsigProvider>
    </div>
  );
}

export default App;
