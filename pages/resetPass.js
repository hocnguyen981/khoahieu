import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      await axios.post('/forgot-password', { email });
      alert('An email has been sent with instructions to reset your password');
      setEmail('');
    } catch(err) {
      console.error(err);
      alert('Could not send reset link');
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Send reset link</button>
      </form>
    </div>
  );
}

const ResetPassword = ({ resetToken }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      await axios.post('/reset-password', { resetToken, password });
      alert('Password reset successful');
      setPassword('');
      setConfirmPassword('');
    } catch(err) {
      console.error(err);
      alert('Could not reset password');
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>New password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label>Confirm password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button type="submit">Reset password</button>
      </form>
    </div>
  );
}

const App = () => {
  const [resetToken, setResetToken] = useState('');

  const handleResetTokenChange = (e) => {
    setResetToken(e.target.value);
  }

  return (
    <div>
      <h1>Forgot password</h1>
      <ForgotPassword />
      <hr />
      <h1>Reset password</h1>
      <label>Reset token</label>
      <input type="text" value={resetToken} onChange={handleResetTokenChange} />
      <ResetPassword resetToken={resetToken} />
    </div>
  );
}

export default App;
