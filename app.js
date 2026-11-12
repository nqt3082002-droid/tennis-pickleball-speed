
(() => {
  const $ = id => document.getElementById(id);
  const video = $("video");
  const canvas = $("canvas");
  const ctx = canvas.getContext("2d", {willReadFrequently:true});

  let stream = null;
  let tracking = false;
  let running = false;
  let lastPoint = null;
  let scale = 0;
  let best = 0;
  let count = 0;
  let history = [];
  let raf = 0;

  const fmt = n => n.toFixed(1);
  const status = s => $("status").textContent = s;

  function showSpeed(kmh) {
    const value = $("unit").value === "mph" ? kmh / 1.609344 : kmh;
    $("speed").textContent = fmt(value);
    $("unitLabel").textContent = $("unit").value + " · Ước tính";
    best = Math.max(best, kmh);
    const bestValue = $("unit").value === "mph" ? best / 1.609344 : best;
    $("best").textContent = fmt(bestValue) + " " + $("unit").value;
    count++;
    $("count").textContent = count;
    history.unshift({time:new Date().toLocaleTimeString(),speed:kmh});
    $("history").innerHTML = history.slice(0,30).map(x =>
      "<div>" + x.time + " — <b>" +
      fmt($("unit").value === "mph" ? x.speed/1.609344 : x.speed) +
      " " + $("unit").value + "</b></div>"
    ).join("");
  }

  $("unit").onchange = () => {
    $("unitLabel").textContent = $("unit").value + " · Ước tính";
  };

  $("start").onclick = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video:{facingMode:"environment",width:1280,height:720},
        audio:false
      });
      video.srcObject = stream;
      await video.play();
      $("start").disabled = true;
      $("stop").disabled = false;
      $("measure").disabled = false;
      status("Camera đã bật. Hãy hiệu chuẩn trước khi đo.");
    } catch(e) {
      status("Không mở được camera: " + e.message);
    }
  };

  $("stop").onclick = () => {
    running = false;
    tracking = false;
    cancelAnimationFrame(raf);
    if(stream) stream.getTracks().forEach(t => t.stop());
    stream = null;
    video.srcObject = null;
    $("start").disabled = false;
    $("stop").disabled = true;
    $("measure").disabled = true;
    $("measure").textContent = "Bắt đầu đo";
    status("Đã dừng camera.");
  };

  $("calibrate").onclick = () => {
    const m = Number($("distance").value);
    const px = Number($("pixels").value);
    if(m <= 0 || px <= 0) {
      status("Hãy nhập khoảng cách mét và pixel hợp lệ.");
      return;
    }
    scale = m / px;
    status("Đã hiệu chuẩn: " + scale.toFixed(5) + " mét/pixel.");
  };

  $("measure").onclick = () => {
    if(!scale) {
      status("Bạn cần hiệu chuẩn trước.");
      return;
    }
    tracking = !tracking;
    lastPoint = null;
    $("measure").textContent = tracking ? "Dừng đo" : "Bắt đầu đo";
    status(tracking ? "Đang theo dõi bóng..." : "Đã tạm dừng.");
    if(tracking && !running) {
      running = true;
      scan();
    }
  };

  $("reset").onclick = () => {
    best = 0;
    count = 0;
    history = [];
    $("best").textContent = "—";
    $("count").textContent = "0";
    $("speed").textContent = "—";
    $("history").textContent = "Chưa có dữ liệu.";
  };

  function scan() {
    if(!running) return;
    raf = requestAnimationFrame(scan);
    if(!tracking || video.readyState < 2) return;

    const w = Math.min(480, video.videoWidth);
    const h = Math.round(video.videoHeight * w / video.videoWidth);
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video,0,0,w,h);

    let data;
    try {
      data = ctx.getImageData(0,0,w,h).data;
    } catch(e) { return; }

    let sx=0, sy=0, n=0;
    for(let y=0;y<h;y+=3) {
      for(let x=0;x<w;x+=3) {
        const i=(y*w+x)*4;
        const r=data[i], g=data[i+1], b=data[i+2];
        const yellow=r>145 && g>125 && b<125 && r>b*1.35;
        const green=g>105 && g>r*1.18 && g>b*1.12;
        if(yellow || green) {
          sx+=x; sy+=y; n++;
        }
      }
    }

    if(n>=3) {
      const now=performance.now();
      const p={x:sx/n,y:sy/n,t:now};

      if(lastPoint) {
        const dt=(p.t-lastPoint.t)/1000;
        const dx=p.x-lastPoint.x;
        const dy=p.y-lastPoint.y;
        const distance=Math.hypot(dx,dy)*scale;
        if(dt>0.015 && dt<0.35 && distance>0.015) {
          const kmh=distance/dt*3.6;
          if(kmh<350) showSpeed(kmh);
        }
      }
      lastPoint=p;
    } else if(lastPoint && performance.now()-lastPoint.t>250) {
      lastPoint=null;
    }
  }
})();
