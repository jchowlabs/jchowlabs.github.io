import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PasskeyDemoInit from '@/components/PasskeyDemoInit';

export const metadata = {
  title: 'Passkey Playground | jchowlabs',
};

export default function PasskeyDemoPage() {
  return (
    <div className="page-wrapper content-page passkey-demo-page">
      <Header currentPage="lab" />
      <main>
        <div className="passkey-demo">
          <div className="demo-content">
            <div className="input-container">
              <h1 className="demo-title">
                <img src="/static/images/passkey-icon.png" alt="Passkey icon" />
                Passkey Playground
              </h1>
              <div className="form-group">
                <input type="email" id="email" placeholder="you@example.com" required autoFocus />
              </div>

              <div className="button-group">
                <button className="btn btn-register" id="registerBtn" disabled>Register</button>
                <button className="btn btn-signin" id="signinBtn" disabled>Login</button>
              </div>

              <div className="status-message" id="statusMessage"></div>

              <div className="info-section">
                <h3>Getting Started:</h3>
                <ul>
                  <li data-number="1">Enter an email address</li>
                  <li data-number="2">Click &quot;Register&quot; button</li>
                  <li data-number="3">Watch &quot;Registration&quot; flow</li>
                  <li data-number="4">Click &quot;Login&quot; button</li>
                  <li data-number="5">Watch &quot;Login&quot; flow</li>
                </ul>
                <div className="demo-notice">
                  <div className="demo-notice-icon">i</div>
                  <div className="demo-notice-content">
                    <p>This demo is for education purposes only. No email, credentials or biometric data are saved.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="demo-container">
              <div className="visualization">
                <div className="parties">
                  <div className="party">
                    <div className="party-icon"><img src="/static/images/device.png" alt="Device" /></div>
                    <h3>Your Device</h3>
                  </div>
                  <div className="party">
                    <div className="party-icon"><img src="/static/images/idp.png" alt="Identity Provider" /></div>
                    <h3>Identity Provider</h3>
                  </div>
                </div>
                <div className="flow-area" id="flowArea"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <PasskeyDemoInit />
    </div>
  );
}
