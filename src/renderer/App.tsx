// import useState from react
import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Typography, Table, Button, Upload } from 'antd';

const columns = [
  {
    title: '#',
    dataIndex: 'key',
    key: 'key',
  },
  {
    title: 'Link',
    dataIndex: 'link',
    key: 'link',
  },
];

const Hello = () => {
  // create hook
  const [filePath, setFilePath] = useState<string>('');
  const [destinationPath, setDestinationPath] = useState<string>('');
  const [data, setData] = useState<Array<any>>([]);

  // set up ipc listener
  window.electron.ipcRenderer.on('file-uploaded', (event) => {
    const dataSource = [];
    for (let i = 1; i <= event.length; i++) {
      dataSource.push({
        key: i,
        link: event[i - 1],
      });
    }

    setData(dataSource);
  });

  const getDestinationPathFromFile = async () => {
    window.electron.ipcRenderer.sendMessage('directory-selected', []);
  };

  window.electron.ipcRenderer.on('directory-selected', (event) => {
    setDestinationPath(event[0]);
  });
  return (
    <div>
      <table>
        <tr>
          <td>
            <Button onClick={getDestinationPathFromFile}>
              Select Directory
            </Button>
            <Typography.Text>{filePath}</Typography.Text>
          </td>
          {/* select file  */}
          <td>
            <Upload
              accept=".xlsx, .xls, .csv"
              beforeUpload={(file) => {
                setFilePath(file.path);
                window.electron.ipcRenderer.sendMessage('file-uploaded', [
                  file.path,
                ]);
                return false;
              }}
            >
              <Button>Select File</Button>
            </Upload>
          </td>
        </tr>
      </table>
      <Table columns={columns} dataSource={data} />
      <table>
        <tr>
          <td>
            <Button
              onClick={() => {
                window.electron.ipcRenderer.sendMessage('download-file', [
                  destinationPath,
                  data,
                ]);
              }}
            >
              Download Files
            </Button>
          </td>
          <td>
            <Button
              onClick={() => {
                window.location.reload();
              }}
            >
              Clear Selection
            </Button>
          </td>
        </tr>
      </table>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
