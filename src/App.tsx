import { useState, useEffect } from "react";
import { get } from "idb-keyval";
import { JsonEditor } from "json-edit-react";
import omit from "lodash/omit";
import "./App.css";

function App() {
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle>();

  const [logs, setLogs] = useState<unknown[]>([]);

  const updateLogs = (contents: string) => {
    const items = contents.split("\n");
    items.reverse();
    setLogs(
      items
        .map((item) => {
          const log = item.trim() !== "" ? JSON.parse(item) : ({} as unknown);

          if (log.level) {
            const date = new Date(log.time).toString();

            log.time = date;
            log.url = `${log.baseURL}${log.url}`;
          }
          return omit(log, ["level", "pid", "hostname", "baseURL"]);
        })
        .slice(1),
    );
  };

  const onClick = async () => {
    const [handle] = await window.showOpenFilePicker();
    const file = await handle.getFile();
    setFileHandle(handle);
    const contents = await file.text();
    updateLogs(contents);
  };

  useEffect(() => {
    const getFile = async () => {
      const handle = await get("file");
      if (handle) {
        // setFileHandle(handle);
      }
    };
    getFile();
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      if (fileHandle) {
        const file = await fileHandle.getFile();
        const contents = await file.text();
        updateLogs(contents);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [fileHandle]);

  return (
    <>
      <button type="button" onClick={onClick}>
        Select File
      </button>
      {logs.map((log, index) => (
        <JsonEditor
          key={index}
          data={log as object}
          collapse={2}
          restrictAdd
          restrictEdit
          restrictDelete
        />
      ))}
    </>
  );
}

export default App;
