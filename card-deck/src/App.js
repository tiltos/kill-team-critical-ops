import "./App.css";
import data from "./data/tacops.json";
import { useEffect, useState } from "react";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

function ShowTacOps() {
  const [tacOpsData, setTacOpsList] = useState(data);
  const [archetype, setArchetype] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("all");

  function saveCard(cardName) {
    if (savedCards.length < 3) {
      setSavedCards((savedCards) => [...savedCards, cardName]);
      localStorage.setItem("savedCards", savedCards);
    }
  }

  function removeCard(cardName) {
    setSavedCards(savedCards.filter((tacop) => tacop !== cardName));
    localStorage.setItem("savedCards", JSON.stringify(savedCards));
  }

  useEffect(() => {
    if (!loaded) {
      setSavedCards(JSON.parse(localStorage.getItem("savedCards", savedCards)) || "");
    } else {
      localStorage.setItem("savedCards", JSON.stringify(savedCards));
    }

    return setLoaded(true);
  }, [savedCards]);

  return (
    <>
      <div className={`tabs active-${tab}`}>
        <div
          className={`tab ${tab === "all" ? "active" : ""}`}
          onClick={() => {
            setTab("all");
          }}
        >
          All Cards
        </div>
        <div
          className={`tab ${tab === "saved" ? "active" : ""}`}
          onClick={() => {
            setTab("saved");
          }}
        >
          Saved ({savedCards.length}/3)
        </div>
      </div>
      <div className={`tab-body active-${tab}`}>
        <div className="all">
          <div className="tacops-filters">
            <div className="filter-group">
              <div className="label">Filter</div>
              <select
                onChange={(e) => {
                  setArchetype(e.target.value);
                }}
              >
                <optgroup label="Shared">
                  <option key="all" value="">
                    All
                  </option>
                  <option key="Faction" value="faction">
                    Faction
                  </option>
                </optgroup>
                <optgroup label="Archetype">
                  <option key="Security" value="security">
                    Security
                  </option>
                  <option key="Seek & Destroy" value="seek-destroy">
                    Seek & Destroy
                  </option>
                  <option key="Recon" value="recon">
                    Recon
                  </option>
                  <option key="Infiltration" value="infiltration">
                    Infiltration
                  </option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="tacop-cards">
            {tacOpsData
              .filter((tacOp) =>
                archetype ? tacOp.archetype === archetype : true
              )
              //.sort((a, b) => (a.name > b.name ? 1 : -1))
              .map((tacOp) => {
                return (
                  <div
                    className={
                      savedCards.includes(tacOp.name)
                        ? `card ${tacOp.archetype} selected`
                        : `card ${tacOp.archetype} `
                    }
                    key={tacOp.archetype + tacOp.name}
                  >
                    <div className="archetype">{tacOp.archetypeLabel}</div>

                    <div className="middle">
                      <h2 className="name">{tacOp.name}</h2>
                      <div className="occurance">
                        <ReactMarkdown
                          children={tacOp.occurance}
                          rehypePlugins={[rehypeRaw]}
                        />
                      </div>
                      <div className="description">
                        <ReactMarkdown
                          children={tacOp.description}
                          rehypePlugins={[rehypeRaw]}
                        />
                      </div>
                    </div>
                    <div className="footer">
                      {savedCards.includes(tacOp.name) ? (
                        <div
                          className="btn select"
                          onClick={() => removeCard(tacOp.name)}
                        >
                          Remove
                        </div>
                      ) : (
                        savedCards.length < 3 && (
                          <div
                            className="btn select"
                            onClick={() => {
                              saveCard(tacOp.name);
                            }}
                          >
                            Select
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="saved">
          <div className="saved-cards">
            {tacOpsData
              .filter(
                (tacOp) =>
                  savedCards[0] === tacOp.name ||
                  savedCards[1] === tacOp.name ||
                  savedCards[2] === tacOp.name
              )
              .map((tacOp) => {
                return (
                  <div
                    className={"card " + tacOp.archetype}
                    key={tacOp.archetype + tacOp.name}
                  >
                    <div className="archetype">{tacOp.archetypeLabel}</div>

                    <div className="middle">
                      <h2 className="name">{tacOp.name}</h2>
                      <div className="occurance">
                        <ReactMarkdown
                          children={tacOp.occurance}
                          rehypePlugins={[rehypeRaw]}
                        />
                      </div>
                      <div className="description">
                        <ReactMarkdown
                          children={tacOp.description}
                          rehypePlugins={[rehypeRaw]}
                        />
                      </div>
                    </div>
                    <div className="footer">
                      <div
                        className="btn select"
                        onClick={() => removeCard(tacOp.name)}
                      >
                        Remove
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Kill Team Critical Operations TacOps</h1>
      </header>
      <ShowTacOps />
    </div>
  );
}
