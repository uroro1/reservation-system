// 전역 변수
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;
let reservations = JSON.parse(localStorage.getItem('reservations')) || [];

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    setupEventListeners();
    loadReservations();
});

// 캘린더 초기화
function initializeCalendar() {
    renderCalendar();
    updateTimeSelection();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 이전/다음 달 버튼
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // 폼 제출
    document.getElementById('reservationForm').addEventListener('submit', handleFormSubmit);
    
    // 연락처 자동 포맷팅
    document.getElementById('phone').addEventListener('input', formatPhoneNumber);
}

// 캘린더 렌더링
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 월 제목 업데이트
    document.getElementById('monthTitle').textContent = `${year}년 ${month + 1}월`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // 요일 헤더
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'weekday';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // 날짜 그리드
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // 이전/다음 달 날짜는 비활성화
        if (date.getMonth() !== month) {
            dayElement.classList.add('disabled');
        } else {
            // 오늘 이전 날짜는 비활성화
            if (date < new Date().setHours(0, 0, 0, 0)) {
                dayElement.classList.add('disabled');
            } else {
                // 사용자 페이지에서는 예약된 날짜 표시 없이 클릭 가능하게
                dayElement.addEventListener('click', () => selectDate(date));
            }
        }
        
        dayElement.textContent = date.getDate();
        calendarGrid.appendChild(dayElement);
    }
}

// 날짜 선택
function selectDate(date) {
    selectedDate = date;
    
    // 이전 선택 해제
    document.querySelectorAll('.calendar-day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    // 새 선택 표시
    event.target.classList.add('selected');
    
    // 시간 선택 표시
    updateTimeSelection();
    document.querySelector('.time-selection').classList.add('show');
}

// 시간 선택 업데이트
function updateTimeSelection() {
    if (!selectedDate) return;
    
    const timeGrid = document.getElementById('timeGrid');
    timeGrid.innerHTML = '';
    
    const timeSlots = [
        '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
    ];
    
    timeSlots.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = time;
        
        // 이미 예약된 시간은 비활성화
        if (isTimeSlotReserved(selectedDate, time)) {
            timeSlot.classList.add('disabled');
        } else {
            timeSlot.addEventListener('click', () => selectTime(time));
        }
        
        timeGrid.appendChild(timeSlot);
    });
}

// 시간 선택
function selectTime(time) {
    selectedTime = time;
    
    // 이전 선택 해제
    document.querySelectorAll('.time-slot.selected').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // 새 선택 표시
    event.target.classList.add('selected');
    
    // 폼 활성화
    document.getElementById('reservationForm').style.display = 'block';
}

// 폼 제출 처리
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
        alert('날짜와 시간을 선택해주세요.');
        return;
    }
    
    const formData = new FormData(e.target);
    const reservation = {
        id: Date.now(),
        name: formData.get('name'),
        phone: formData.get('phone'),
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        memo: formData.get('memo') || '',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // 예약 저장
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    
    // 로딩 표시
    showLoading();
    
    // 1.3초 후 완료 페이지로 이동
    setTimeout(() => {
        hideLoading();
        showSuccessModal();
    }, 1300);
}

// 로딩 표시
function showLoading() {
    const loading = document.querySelector('.loading');
    loading.classList.add('show');
    
    // 폼 숨기기
    document.getElementById('reservationForm').style.display = 'none';
}

// 로딩 숨기기
function hideLoading() {
    const loading = document.querySelector('.loading');
    loading.classList.remove('show');
}

// 성공 모달 표시
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
    
    // 폼 초기화
    document.getElementById('reservationForm').reset();
    selectedDate = null;
    selectedTime = null;
    
    // 선택 해제
    document.querySelectorAll('.calendar-day.selected, .time-slot.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // 시간 선택 숨기기
    document.querySelector('.time-selection').classList.remove('show');
    document.getElementById('reservationForm').style.display = 'none';
    
    // 캘린더 새로고침
    renderCalendar();
}

// 예약 데이터 로드
function loadReservations() {
    // 예약이 있는 날짜 표시
    renderCalendar();
}

// 특정 날짜에 예약이 있는지 확인
function hasReservationOnDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.some(reservation => 
        reservation.date === dateStr && reservation.status !== 'cancelled'
    );
}

// 특정 시간대가 예약되었는지 확인
function isTimeSlotReserved(date, time) {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.some(reservation => 
        reservation.date === dateStr && 
        reservation.time === time && 
        reservation.status !== 'cancelled' && 
        reservation.status !== 'rejected'
    );
}

// 날짜 포맷팅
function formatDate(date) {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// 시간 포맷팅
function formatTime(time) {
    return time;
}

// 연락처 자동 포맷팅
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/[^\d]/g, ''); // 숫자만 추출
    
    if (value.length <= 3) {
        value = value;
    } else if (value.length <= 7) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    } else {
        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    
    e.target.value = value;
}
