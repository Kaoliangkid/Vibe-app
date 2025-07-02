const patternsDiv = document.getElementById("patterns");
const testBtn     = document.getElementById("testBtn");
let selected;

// build the radio-button list
Object.keys(patterns).forEach(name => {
  const lbl = document.createElement("label");
  const r   = document.createElement("input");
  r.type    = "radio";
  r.name    = "pattern";
  r.value   = name;
  r.onchange = () => selected = patterns[name];

  lbl.append(r, " ", name);
  patternsDiv.append(lbl, document.createElement("br"));
});

// fire the vibration
testBtn.onclick = () => {
  if (!selected) return alert("Pick a pattern first!");
  navigator.vibrate(selected);
};
