import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import { url } from "../const";
import { Header } from "../components/Header";
import "./newTask.scss";

const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

export function NewTask() {
  const [selectListId, setSelectListId] = useState();
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  // 締め切り時刻をdayjs型で保持する。また初期値としてローカルタイムゾーンに合わせた現在時刻をdayjs型で持つ。
  const [limit, setLimit] = useState(dayjs());
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const navigate = useNavigate();
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleSelectList = (id) => setSelectListId(id);
  // datetime-localで入力された文字列（2017-06-01T08:30）をdayjs型で保持する。
  const handleLimitChange = (e) => setLimit(dayjs(e.target.value));

  const onCreateTask = () => {
    // APIを通じたデータのやり取り用の変数
    console.log(limit)
    const data = {
      title,
      detail,
      done: false,
      // data変数として持つときのみ、APIを通じたやり取りに準じてYYYY-MM-DDTHH:MM:SSZ（UTC）の型の文字列に変換する。
      limit: limit.utc().format('YYYY-MM-DDTHH:mm:ssZ')
    };
    console.log(data.limit)

    axios
      .post(`${url}/lists/${selectListId}/tasks`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`タスクの作成に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
        setSelectListId(res.data[0]?.id);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  return (
    <div>
      <Header />
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <label>リスト</label>
          <br />
          <select
            onChange={(e) => handleSelectList(e.target.value)}
            className="new-task-select-list"
          >
            {lists.map((list, key) => (
              <option key={key} className="list-item" value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
          <br />
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="new-task-title"
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="new-task-detail"
          />
          <br />
          <label>締め切り日</label>
          <br />
          <input
            type="datetime-local"
            onChange={handleLimitChange}
            className="edit-task-limit"
             /* limitの状態をdatatime-localの入力時のフォーマットに合わせる */
            value={limit.format("YYYY-MM-DDTHH:mm")}
          />
          <br />
          <button
            type="button"
            className="new-task-button"
            onClick={onCreateTask}
          >
            作成
          </button>
        </form>
      </main>
    </div>
  );
}
