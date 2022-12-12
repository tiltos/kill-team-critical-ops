import "./App.css";
import data from "./data/tacops.json";
import { useState } from "react";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw'

function ShowTacOps() {
  const [tacOpsData, setTacOpsList] = useState(data);
  const [archetype, setArchetype] = useState(null);

  return (
    <>
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
          .filter((tacOp) => (archetype ? tacOp.archetype === archetype : true))
          //.sort((a, b) => (a.name > b.name ? 1 : -1))
          .map((tacOp) => {
            return (
              <div
                className={"card " + tacOp.archetype}
                key={tacOp.archetype + tacOp.name}
              >
                <div className="archetype">{tacOp.archetypeLabel}</div>

                <div className="middle">
                  <h2 className="name">{tacOp.name}</h2>
                  <div className="occurance"><ReactMarkdown children={tacOp.occurance} rehypePlugins={[rehypeRaw]} /></div>
                  <div className="description"><ReactMarkdown children={tacOp.description} rehypePlugins={[rehypeRaw]} /></div>
                </div>
              </div>
            );
          })}
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
