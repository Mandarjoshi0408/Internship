import { useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import toast from 'react-hot-toast';

const BiometricCamera = ({ studentId, onClose }: { studentId: number, onClose: () => void }) => {
  const webcamRef = useRef<Webcam>(null);

  const handleCapture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    
    if (!imageSrc) {
      toast.error("Camera feed not ready");
      return;
    }

    const load = toast.loading("Saving Biometrics...");
    try {
      // POSTING to the student-specific route
      await axios.post(`http://localhost:8000/enroll-face/${studentId}`, {
        image: imageSrc 
      });
      toast.success("Enrolled Successfully!", { id: load });
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Connection Error";
      toast.error(errorMsg, { id: load });
    }
  };

  return (
    <div style={styles.overlay}>
       <div style={styles.modal}>
          <h3 style={{color: '#fff', marginBottom: '15px'}}>Align Your Face</h3>
          <Webcam 
            audio={false} 
            ref={webcamRef} 
            screenshotFormat="image/jpeg" 
            style={styles.web} 
          />
          <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
            <button onClick={handleCapture} style={styles.btn}>Capture</button>
            <button onClick={onClose} style={styles.cancel}>Cancel</button>
          </div>
       </div>
    </div>
  );
};

const styles: any = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
    modal: { background: '#1a1b26', padding: '25px', borderRadius: '20px', textAlign: 'center', border: '1px solid #2e303e' },
    web: { width: '400px', height: '400px', objectFit: 'cover', borderRadius: '15px', marginBottom: '20px', border: '2px solid #6366f1' },
    btn: { background: '#6366f1', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    cancel: { background: '#2e303e', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer' }
};

export default BiometricCamera;