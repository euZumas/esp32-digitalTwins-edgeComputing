import { MdLogout } from "react-icons/md";
import { GoBellFill } from "react-icons/go";
import { IoMdVolumeHigh, IoMdVolumeOff } from "react-icons/io";
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

import hare1 from '../../assets/coelho-sprite1.png';
import hare2 from '../../assets/coelho-sprite2.png';
import sensorG from '../../assets/sensor-g.png';
import sensorR from '../../assets/sensor-r.png';

import '../../styles/Home.css';
import '../../styles/common.css';

const POLL_MS = 2500; // polling em 2.5s

const Home = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [room, setRoom] = useState("Carregando...");
  const [espOnline, setEspOnline] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const firstName = user.name ? user.name.split(" ")[0] : "Usuário";
    if (!token) { navigate('/auth/login'); return; }

    const h1 = document.querySelector("header h1");
    if (h1) h1.innerText = `Olá, ${firstName}`;

    fetchAll();
    const interval = setInterval(fetchAll, POLL_MS);
    return () => { mounted.current = false; clearInterval(interval); }
  }, [navigate]);

  async function fetchAll() {
    await Promise.all([fetchRoom(), fetchActivities(), checkEspConnection()]);
  }

  const fetchRoom = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/sensor/room');
      if (!res.ok) throw new Error('room fetch failed');
      const json = await res.json();
      if (mounted.current) setRoom(json.room || "Indefinido");
    } catch (error) {
      if (mounted.current) setRoom("Erro ao carregar");
      console.error("fetchRoom:", error);
    }
  };

  const handleRoomChange = async (e) => {
    const selectedRoom = e.target.value;
    try {
      await fetch('http://localhost:3000/api/sensor/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: selectedRoom })
      });
      setRoom(selectedRoom);
    } catch (error) {
      console.error("handleRoomChange:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/sensor/active?limit=50');
      if (!res.ok) {
        console.error("fetchActivities: resposta não-ok", res.error);
        setActivities([]);
        return;
      }
      const data = await res.json();

      // 🔹 Atualiza alerta de movimento conforme o último registro
      if (data && data.length > 0) {
        const latest = data[0];
        if (latest.motion === true && latest.duration == null) {
          setMotionDetected(true);
        } else if (latest.motion === false || latest.duration != null) {
          setMotionDetected(false);
        }
      } else {
        setMotionDetected(false);
      }

      const formatted = data.map(item => {
        const start = new Date(item.timestamps || item.createdAt);
        start.setHours(start.getHours() + 3);
        const hours = start.getHours().toString().padStart(2, '0');
        const minutes = start.getMinutes().toString().padStart(2, '0');
        return {
          ...item,
          formattedDate: start.toLocaleDateString("pt-BR"),
          formattedTime: `${hours}:${minutes}`,
          durationSeconds: typeof item.duration === 'number' ? item.duration : null,
          displayDuration: typeof item.duration === 'number' ? `${item.duration}s` : '—',
        };
      });

      if (mounted.current) setActivities(formatted);
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      if (mounted.current) setActivities([]);
    }
  };

  const checkEspConnection = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/sensor'); // ping simples
      if (mounted.current) setEspOnline(res.ok);
    } catch (error) {
      if (mounted.current) setEspOnline(false);
    }
  };

  // 🔹 Dados agrupados para o gráfico
  const chartData = Object.values(
    activities.reduce((acc, cur) => {
      const key = cur.room || "Indefinido";
      acc[key] = acc[key] || { room: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {})
  );

  return (
    <div className="flex-c">
      <header className="flex">
        <h1>Olá, Usuário</h1>

        <span className="flex-c enviroment">
          <label>ambiente monitorado</label>
          <select className="bold" value={room} onChange={handleRoomChange}>
            <option>Laboratório 1</option>
            <option>Laboratório 2</option>
            <option>Sala de Aula</option>
            <option>Biblioteca</option>
            <option>Sala 01</option>
          </select>
        </span>

        <button className="flex" onClick={() => { localStorage.clear(); navigate('/auth/login'); }}>
          <MdLogout className="h-icon" />
        </button>
      </header>

      <main className="flex">
        <section id="section1" className="flex-c">
          {/* 🔔 Box de alerta atualizado */}
          <div id="alert" className={`flex h-border ${motionDetected ? 'alert-active' : 'alert-inactive'}`}>
            <div className="flex al-center">
              <img src={motionDetected ? hare1 : hare2} alt="coelho" />
              <small className="bold">
                {motionDetected ? "🚨 ALERTA DE MOVIMENTO!" : "ausência de atividade"}
              </small>
            </div>
            {motionDetected && <GoBellFill className="h-icon" />}
          </div>

          <div id="control-panel-box" className="flex h-border">
            <div className="flex-c al-center jc-center">
              <span id="active" className="bold">{activities.length}</span>
              <small className="bold">atividades registradas</small>
            </div>

            <hr />

            <div id="control-panel" className="flex-c">
              <h2>Painel de Controle</h2>

              <span className="flex gap al-center status-fixed">
                <img src={espOnline ? sensorG : sensorR} alt="sensor" className="h-icon" />
                <small>{espOnline ? "ESP32 Online" : "ESP32 Offline"}</small>
              </span>

              <span className="flex gap al-center">
                {silentMode ? <IoMdVolumeOff className="h-icon text-red" /> : <IoMdVolumeHigh className="h-icon" />}
                <small>{silentMode ? "Modo silencioso" : "Som ativo"}</small>
              </span>

              <div className="flex al-center gap">
                <small>Silenciar buzzer</small>
                <label className="switch">
                  <input type="checkbox" checked={silentMode} onChange={() => setSilentMode(s => !s)} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* 🔹 Gráfico de atividades por ambiente */}
          <div id="activity-chart" className="flex-c h-border">
            <h2>Atividades por Ambiente</h2>
            {chartData.length === 0 ? (
              <p>Nenhum dado para exibir.</p>
            ) : (
              <ResponsiveContainer width="95%" height={250}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}  
                >
                  <XAxis dataKey="room" stroke="#ccc" />
                  <YAxis allowDecimals={false} stroke="#ccc" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(23, 35, 54, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.875rem'
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />











                  
                  <Bar dataKey="count" fill="#7B97E3" barSize={40} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section id="section2" className="flex-c h-border">
          <h2>Histórico de Atividades</h2>
          <div className="activities-container">
            {activities.length === 0 ? <p>Nenhuma atividade registrada.</p> : activities.map((item, i) => (
              <div key={i} className="activities-wrapper">
                <div className="flex-c active-box">
                  <h4>{item.room}</h4>
                  <div className="flex jc-between">
                    <span>Data: {item.formattedDate}</span>
                    <span>Horário: {item.formattedTime}</span>
                    <span>Duração: {item.durationSeconds != null ? `${item.durationSeconds}s` : '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;