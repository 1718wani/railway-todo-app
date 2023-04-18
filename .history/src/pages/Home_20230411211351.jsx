import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useMedia } from "react-use";
import axios from "axios";
import "./home.scss";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import { Header } from "../components/Header";
import { url } from "../const";

dayjs.extend(duration);
dayjs.extend(utc);

export function Home() {
  const [isDoneDisplay, setIsDoneDisplay] = useState("todo"); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  const isMobile = useMedia("(max-width: 320px)");
  const isTablet = useMedia("(max-width: 768px)");


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
          {isTablet && (
            // スマホもしくはタブレットの場合の表示
            <div>
              <div className="list-header">
                <h2>リスト一覧</h2>
              </div>
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
          )}

          {!isMobile && !isTablet && (
            // PCの場合の表示
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
          )}

          {isMobile && (
              <div></div
          )}

          {!isMobile &&(
             <ul role="tablist" className="list-tab">
             {lists.map((list) => {
               // リストを順番に見ていって、ListIDがセレクトIDになっているところがセレクト箇所
               const isActive = list.id === selectListId;
               return (
                 <li
                   role="presentation"
                   key={list.id}
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

          )}

          

         

          {isTablet && (
            // スマホもしくはタブレットの場合の表示
            <div className="tasks">
              <div className="tasks-header">
                <h2>タスク一覧</h2>
              </div>
              <Link to="/task/new">タスク新規作成</Link>
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
                isMobile={isMobile}
                isTablet={isTablet}
              />
            </div>
          )}

          {!isMobile && !isTablet && (
            // PCの場合の表示
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
                isMobile={isMobile}
                isTablet={isTablet}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// 表示するタスク
function Tasks(props) {
  const { tasks, selectListId, isDoneDisplay, isMobile, isTablet } = props;

  const convertDateForDisplay = (dataStr) =>
    dayjs(dataStr).local().format("YYYY年MM月DD日HH時mm分"); // ユーザーのタイムゾーンに合わせて2022-11-22T09:00:00+09:00のような形に

  // 残り時間を分単位で計算する関数
  const calculateTimeLeft = (limitTime) => {
    const limitDate = dayjs(limitTime).local();
    // UTCで保存された文字列をlocalのタイムゾーンに変換する
    const now = dayjs().local();
    const diff = limitDate.diff(now);
    const dura = dayjs.duration(diff);

    return limitDate.isAfter(now)
      ? `あと${dura.format("YY年MMヶ月DD日HH時間mm分")}です`
      : `${dura
          .format("YY年MMヶ月DD日HH時間mm分")
          .replaceAll("-", "")}過ぎています`;
  };

  if (tasks === null)
    return (
      <>
        <div />
        <div />
      </>
    );
  // ここにElseの分岐がないのはなぜか
  if (isDoneDisplay === "done") {
    return (
      <ul>
        {tasks
          .filter((task) => task.done === true)
          .map((task) => (
            <li key={task.id} className="task-item">
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
        .map((task) => (
          <li key={task.id} className="task-item">
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
                {calculateTimeLeft(task.limit)}
              </span>
            </Link>
          </li>
        ))}
    </ul>
  );
}
