import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Header } from "../components/Header";
import { url } from "../const";
import "./home.scss";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

export function Home() {
  const [isDoneDisplay, setIsDoneDisplay] = useState("todo"); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);
  // リストが変換されたときだけタスクの配列を状態に入れる。
  useEffect(() => {
    // リスト一個目のIDを獲得する。
    const listId = lists[0]?.id;
    // 以下リストは空じゃない場合
    if (typeof listId !== "undefined") {
      setSelectListId(listId);
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };

  const handleKeyDown = (event, listId) => {
    switch (event.key) {
      case "Enter":
        console.log("エンター押されました！");
        event.preventDefault();
        handleSelectList(listId);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul role="tablist" className="list-tab">
            {lists.map((list, key) => {
              // リストを順番に見ていって、ListIDがセレクトIDになっているところがセレクト箇所
              const isActive = list.id === selectListId;
              return (
                <li
                  role="presentation"
                  key={key}
                  tabIndex={isActive ? "-1" : "0"}
                  className={`list-tab-item ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectList(list.id)}
                  onKeyDown={(event) => handleKeyDown(event, list.id)}
                >
                  {list.title}
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// 表示するタスク
function Tasks(props) {
  const { tasks, selectListId, isDoneDisplay } = props;

  // YYYY-MM-DDTHH:MM:SSZの文字列
  const convertDateForDisplay = (dataStr) => {
    const a = dayjs(dataStr).tz().format("YYYY年MM月DD日HH時mm分"); //JSTの時間の2022-11-22T09:00:00+09:00のような形に
    return a;
  };

  // 残り時間を分単位で計算する関数
  const calculateTimeLeft = (limitTime) => {
    const dateTo = dayjs(limitTime);
    const dateFrom = dayjs().format;
    const year = dateFrom.diff(dateTo, 'year');
    const month = dateFrom.diff(dateTo, 'month');
    const day = dateFrom.diff(dateTo, 'day');
    const hour = dateFrom.diff(dateTo, 'hour');
    const minute = dateFrom.diff(dateTo, 'minute');
  };

  if (tasks === null) return <></>;
  // ここにElseの分岐がないのはなぜか
  if (isDoneDisplay == "done") {
    return (
      <ul>
        {tasks
          .filter((task) => task.done === true)
          .map((task, key) => (
            <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                {task.done ? "完了" : "未完了"}
              </Link>
            </li>
          ))}
      </ul>
    );
  }

  return (
    <ul>
      {tasks
        .filter((task) => task.done === false)
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              {task.done ? "完了" : "未完了"}
              <br />
              <span className="task-item-deadline">
                締め切り: {convertDateForDisplay(task.limit)}
              </span>
              <br />
              <span className="task-item-time-left">
                残り: {calculateTimeLeft(task.limit)}
              </span>
            </Link>
          </li>
        ))}
    </ul>
  );
}
