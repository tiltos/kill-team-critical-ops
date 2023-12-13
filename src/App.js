import "./App.css";
import tacOpsData from "./data/tacops.json";
import missionsData from "./data/missions.json";
import mapsData from "./data/maps.json";
import { useEffect, useState } from "react";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function App() {
  const [archetype, setArchetype] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [hiddenCards, setHiddenCards] = useState([]);
  const [savedMap, setSavedMap] = useState();
  const [savedMapType, setSavedMapType] = useState();
  const [savedMission, setSavedMission] = useState();
  const [savedTime, setSavedTime] = useState();
  const [hasGeneratedMission, setHasGeneratedMission] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("");
  const [mapType, setMapType] = useState("open");
  const [checked, setChecked] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [minutesSinceReset, setMinutesSinceReset] = useState(0);

  const getTime = () => {
    const time = Date.now() - Date.parse(savedTime);
    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setMinutesSinceReset(Math.floor(time / 1000 / 60));
  };

  function changeTab(choice) {
    setTab(choice);
    localStorage.setItem("tab", choice);
  }

  function toggleMapType() {
    let chosenMapType = mapType === "open" ? "close_quarters" : "open";
    setMapType(chosenMapType);
    setChecked(!checked);
    localStorage.setItem("mapType", chosenMapType);
  }

  function generateMission(choice) {
    let ranMap =
      mapType === "open"
        ? Math.floor(Math.random() * 9)
        : Math.floor(Math.random() * 10);
    let ranMission = Math.floor(Math.random() * 3);
    localStorage.setItem("savedMap", ranMap);
    localStorage.setItem("savedMission", ranMission);
    localStorage.setItem("savedMapType", mapType);
    localStorage.setItem("hasGenerated", true);
    setSavedMapType(mapType);
    setSavedMap(ranMap);
    setSavedMission(ranMission);
    setHasGeneratedMission(true);
  }

  function resetMission(choice) {
    setSavedMap(null);
    setSavedMission(null);
    setHasGeneratedMission(false);
    localStorage.removeItem("savedMap");
    localStorage.removeItem("savedMission");
    localStorage.removeItem("hasGenerated");
  }

  function saveCard(cardName) {
    if (savedCards.length < 3) {
      setSavedCards((savedCards) => [...savedCards, cardName]);

      localStorage.setItem("savedCards", savedCards);

      let datestamp = new Date();
      setSavedTime(datestamp);
      localStorage.setItem("lastModified", datestamp);
    }
  }

  function removeCard(cardName) {
    setSavedCards(savedCards.filter((tacop) => tacop !== cardName));
    localStorage.setItem("savedCards", JSON.stringify(savedCards));

    let datestamp = new Date();
    setSavedTime(datestamp);
    localStorage.setItem("lastModified", datestamp);
  }

  function toggleCardVisibility(cardName) {
    if (hiddenCards.includes(cardName)) {
      setHiddenCards(hiddenCards.filter((tacop) => tacop !== cardName));
    } else {
      setHiddenCards((hiddenCards) => [...hiddenCards, cardName]);
    }
  }

  function Timestamp() {
    if (minutesSinceReset > 0) {
      return (
        <>
          Last Changed {days > 0 && days + " day"}
          {days > 1 && "s"} {hours > 0 && hours + " hour"}
          {hours > 1 && "s"} {minutes > 0 && minutes + " minute"}
          {minutes > 1 && "s"} ago
        </>
      );
    } else {
      return <>Changed just now</>;
    }
  }

  function toShowModal() {
    setShowModal(true);
  }
  function hideModal() {
    setShowModal(false);
  }

  useEffect(() => {
    if (!loaded) {
      setSavedCards(JSON.parse(localStorage.getItem("savedCards")) || "");
      setTab(localStorage.getItem("tab") || "");
      setMapType(localStorage.getItem("mapType") || "open");
      setSavedMapType(localStorage.getItem("savedMapType") || "open");
      if (localStorage.getItem("mapType") === "close_quarters") {
        setChecked(true);
      } else {
        setChecked(false);
      }
      setSavedTime(localStorage.getItem("lastModified") || null);
      let hasGenerated = localStorage.getItem("hasGenerated") || false;
      if (hasGenerated) {
        setHasGeneratedMission(true);
        setSavedMap(localStorage.getItem("savedMap") || false);
        setSavedMission(localStorage.getItem("savedMission") || false);
      }
    } else {
      localStorage.setItem("savedCards", JSON.stringify(savedCards));
    }

    return setLoaded(true);
  }, [savedCards]);

  useEffect(() => {
    // const interval = setInterval(() => getTime(), 60000);
    getTime();
    const interval = setInterval(() => getTime(), 6000);
    return () => clearInterval(interval);
  }, [savedTime]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Kill Team Critical Operations Cards</h1>
      </header>
      <div className={`tabs active-${tab}`}>
        <div
          className={`tab ${tab === "missions" ? "active" : ""}`}
          onClick={() => {
            changeTab("missions");
          }}
        >
          Mission Generator
        </div>
        <div
          className={`tab ${tab === "all" ? "active" : ""}`}
          onClick={() => {
            changeTab("all");
          }}
        >
          All Tac Ops
        </div>
        <div
          className={`tab ${tab === "saved" ? "active" : ""}`}
          onClick={() => {
            changeTab("saved");
          }}
        >
          Saved Tac Ops ({savedCards.length}/3)
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
                    Faction (Generic)
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
                <optgroup label="Bespoke Teams">
                  <option key="blooded" value="blooded">
                    Blooded
                  </option>
                  <option key="chaos-cult" value="chaos-cult">
                    Chaos Cult
                  </option>
                  <option key="corsair-voidscarred" value="corsair-voidscarred">
                    Corsair Voidscarred
                  </option>
                  <option
                    key="elucidian-starstrider"
                    value="elucidian-starstrider"
                  >
                    Elucidian Starstrider
                  </option>
                  <option key="exaction-squad" value="exaction-squad">
                    Exaction Squad
                  </option>
                  <option key="farstalker-kinband" value="farstalker-kinband">
                    Farstalker Kinband
                  </option>
                  <option key="fellgor-ravagers" value="fellgor-ravagers">
                    Fellgor Ravagers
                  </option>
                  <option key="gellerpox" value="gellerpox">
                    Gellerpox Infected
                  </option>
                  <option key="hand-of-the-archon" value="hand-of-the-archon">
                    Hand of the Archon
                  </option>
                  <option key="hearthkyn-salvager" value="hearthkyn-salvager">
                    Hearthkyn Salvager
                  </option>
                  <option key="hierotek" value="hierotek">
                    Hierotek Circle
                  </option>
                  <option key="hunter-clade" value="hunter-clade">
                    Hunter Clade
                  </option>
                  <option
                    key="imperial-navy-breachers"
                    value="imperial-navy-breachers"
                  >
                    Imperial Navy Breachers
                  </option>
                  <option key="inquisitorial-agent" value="inquisitorial-agent">
                    Inquisitorial Agent
                  </option>
                  <option key="intercessors" value="intercessors">
                    Intercession Squad
                  </option>
                  <option key="kasrkin" value="kasrkin">
                    Kasrkin
                  </option>
                  <option key="kommandos" value="kommandos">
                    Kommandos
                  </option>
                  <option key="legionary" value="legionary">
                    Legionaries
                  </option>
                  <option key="novitiates" value="novitiates">
                    Novitiates
                  </option>
                  <option key="pathfinders" value="pathfinders">
                    Pathfinders
                  </option>
                  <option key="phobos" value="phobos">
                    Phobos Strike Team
                  </option>
                  <option key="veteran-guardsmen" value="veteran-guardsmen">
                    Veteran Guardsmen
                  </option>
                  <option key="void-dancer-troupe" value="void-dancer-troupe">
                    Void-dancer Troupe
                  </option>
                  <option key="warpcoven" value="warpcoven">
                    Warpcoven
                  </option>
                  <option key="wyrmblade" value="wyrmblade">
                    Wyrmblade
                  </option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="tacop-cards card-set">
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
                        ? `tacop card ${tacOp.archetype} selected`
                        : `tacop card ${tacOp.archetype} `
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
          <div className="timestamp">
            <Timestamp />
          </div>
          <div className="saved-cards card-set">
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
                    className={`tacop card ${
                      hiddenCards.includes(tacOp.name) ? `hidden` : ``
                    } ${tacOp.archetype}`}
                    key={tacOp.archetype + tacOp.name}
                  >
                    <div className="visibility">
                      <div
                        className="hide-btn icon"
                        onClick={() => toggleCardVisibility(tacOp.name)}
                      ></div>
                      <div
                        className="show-btn icon"
                        onClick={() => toggleCardVisibility(tacOp.name)}
                      ></div>
                    </div>
                    <div className="hidden-label">
                      <span>Hidden</span>
                    </div>
                    <div className="inner">
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
                  </div>
                );
              })}
          </div>
        </div>
        <div
          className={hasGeneratedMission ? `missions generated` : `missions`}
        >
          <div className="generator">
            <div className="btn-wrap">
              {hasGeneratedMission ? (
                <>
                  <div
                    className="btn generate-button"
                    onClick={() => generateMission()}
                  >
                    Generate again
                  </div>
                  <div
                    className="btn generate-button"
                    onClick={() => resetMission()}
                  >
                    Reset
                  </div>
                </>
              ) : (
                <div
                  className="btn generate-button"
                  onClick={() => generateMission()}
                >
                  Generate random mission
                </div>
              )}
            </div>
            <div className="map-type-switch">
              <div className="label open">Open Play</div>
              <label className="switch">
                <input
                  type="checkbox"
                  onChange={() => toggleMapType()}
                  checked={checked}
                />
                <span className="slider round"></span>
              </label>
              <div className="label cq">Close Quarters</div>
            </div>
          </div>
          <div className="mission-cards card-set">
            {missionsData.map((mission) => {
              return (
                <div className={"card mission"} key={mission.name}>
                  <div className="head">
                    <div className="label">Mission</div>
                    <div className="title">
                      <div className="letter">{mission.letter}</div>
                      <h2 className="mission-name">{mission.name}</h2>
                    </div>
                  </div>

                  <div className="middle">
                    <h4>Mission Rule</h4>
                    <div className="occurance">
                      <ReactMarkdown
                        children={mission.rule}
                        rehypePlugins={[rehypeRaw]}
                      />
                    </div>
                    <h4>Mission Objective</h4>
                    <div className="description">
                      <ReactMarkdown
                        children={mission.objective}
                        rehypePlugins={[rehypeRaw]}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="map-cards card-set">
            {mapsData.open.map((map) => {
              return (
                <div className={"card map"} key={map.name}>
                  <div className="archetype">{map.name}</div>

                  <div className="middle">
                    <img src={map.file} alt=""/>
                  </div>
                </div>
              );
            })}
            {mapsData.close_quarters.map((map) => {
              return (
                <div className={"card map"} key={map.name}>
                  <div className="archetype">{map.name}</div>

                  <div className="middle">
                    <img src={map.file} alt="" />
                  </div>
                </div>
              );
            })}
            <div className={"card"}>
              <div className="archetype">Map Card Key</div>
              <div className="middle">
                <img src="./img/legend.svg" alt="" />
              </div>
            </div>
          </div>
          {hasGeneratedMission && (
            <div className="generated-mission">
              <div className={"card mission"}>
                <div className="head">
                  <div className="label">Mission</div>
                  <div className="title">
                    <div className="letter">
                      {missionsData[savedMission].letter}
                    </div>
                    <h2 className="mission-name">
                      {missionsData[savedMission].name}
                    </h2>
                  </div>
                </div>

                <div className="middle">
                  <h4>Mission Rule</h4>
                  <div className="occurance">
                    <ReactMarkdown
                      children={missionsData[savedMission].rule}
                      rehypePlugins={[rehypeRaw]}
                    />
                  </div>
                  <h4>Mission Objective</h4>
                  <div className="description">
                    <ReactMarkdown
                      children={missionsData[savedMission].objective}
                      rehypePlugins={[rehypeRaw]}
                    />
                  </div>
                </div>
              </div>
              <div className={"card map"}>
                <div className="archetype">
                  {mapsData[savedMapType][savedMap].name}
                </div>
                <div className="middle">
                  <img src={mapsData[savedMapType][savedMap].file}  alt=""/>
                </div>
              </div>
              <div className={"card"}>
                <div className="archetype">Map Card Key</div>
                <div className="middle">
                  <img src="./img/legend.svg" alt="map legend" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="footer">
        <span href="#" className="about-link" onClick={(e) => toShowModal()}>
          about
        </span>
        &nbsp;|&nbsp;
        <a href="https://www.buymeacoffee.com/dataslate">Buy me a coffee</a>
      </div>
      <div className={`modal-mask ${showModal ? " visible" : " hidden"}`}>
        <div className="modal">
          <h1>About</h1>
          <div className="close-btn" onClick={() => hideModal()}>
            <span></span>
            <span></span>
          </div>
          <div className="modal-contents">
            <p>
              I hope you enjoy using this app! If you spot any typos or errors,
              you can post them on{" "}
              <a href="https://www.reddit.com/r/killteam/comments/zjszpq/heres_an_app_for_the_new_tac_ops_cards/">
                this reddit post
              </a>
              .
            </p>
            <p>
              If you want to show your appreciation you can{" "}
              <a href="https://www.buymeacoffee.com/dataslate">
                buy me a coffee
              </a>
              .
            </p>
            <h2>Changelog</h2>
            <ul>
              <li>
                <b>21 August 2023</b> Added Fellgor Ravager, Hearthkyn Salvager,
                Chaos Cult and Inqusitorial Agent TacOps
              </li>
              <li>
                <b>20 Februry 2023</b> Added Hand of the Archon TacOps
              </li>
              <li>
                <b>14 Februry 2023</b> Added Exaction Squad TacOps
              </li>
              <li>
                <b>28 December 2022</b> Fixed typos
              </li>
              <li>
                <b>17 December 2022</b> Added Close Quarters Map generator
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
