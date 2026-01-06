import type { PopupItem } from './popup.types.ts';
import { popupMock } from './popup.mock.ts';
import { tableStyle } from '../products/styles';

const Popup = () => {
  const popups: PopupItem[] = popupMock;

  return (
    <div>
      <h2>광고 팝업 관리</h2>
      <p>쇼핑몰에 노출되는 팝업 광고를 관리합니다.</p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>제목</th>
            <th>노출 기간</th>
            <th>노출 여부</th>
          </tr>
        </thead>
        <tbody>
          {popups.map(popup => (
            <tr key={popup.id}>
              <td>{popup.title}</td>
              <td>{popup.period}</td>
              <td>{popup.visible ? '노출' : '비노출'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Popup;