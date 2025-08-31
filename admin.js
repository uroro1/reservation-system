// 전역 변수
let currentDate = new Date();
let reservations = [];
let currentCategory = 'all'; // 현재 선택된 카테고리
let selectedCalendarDate = null; // 캘린더에서 선택된 날짜

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    loadReservations();
    initializeCalendar();
    setupEventListeners();
    updateStatistics();
    renderReservationList();
});

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

    // 카테고리 카드 클릭 이벤트
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            selectCategory(category);
        });
    });
}

// 카테고리 선택
function selectCategory(category) {
    currentCategory = category;
    selectedCalendarDate = null; // 날짜 필터 초기화
    
    // 활성화된 카테고리 표시 업데이트
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // 예약 목록 다시 렌더링
    renderReservationList();
    
    // 필터 텍스트 업데이트
    updateFilterText();
}

// 필터 텍스트 업데이트
function updateFilterText() {
    const filterText = document.getElementById('reservationFilterText');
    let text = '';
    
    if (selectedCalendarDate) {
        const dateStr = formatDate(selectedCalendarDate);
        if (currentCategory === 'all') {
            text = `${dateStr}의 모든 예약 현황을 관리하세요`;
        } else {
            const statusText = getStatusText(currentCategory);
            text = `${dateStr}의 ${statusText} 예약을 관리하세요`;
        }
    } else {
        if (currentCategory === 'all') {
            text = '전체 예약 현황을 관리하세요';
        } else {
            const statusText = getStatusText(currentCategory);
            text = `${statusText} 예약을 관리하세요`;
        }
    }
    
    filterText.textContent = text;
}

// 예약 데이터 로드
function loadReservations() {
    reservations = JSON.parse(localStorage.getItem('reservations')) || [];
}

// 캘린더 초기화
function initializeCalendar() {
    renderCalendar();
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
            // 예약이 있는 날짜 표시
            if (hasReservationOnDate(date)) {
                dayElement.classList.add('has-reservation');
            }
            
            // 선택된 날짜 표시
            if (selectedCalendarDate && date.toDateString() === selectedCalendarDate.toDateString()) {
                dayElement.classList.add('selected');
            }
            
            // 클릭 이벤트 추가
            dayElement.addEventListener('click', () => selectCalendarDate(date));
        }
        
        dayElement.textContent = date.getDate();
        calendarGrid.appendChild(dayElement);
    }
}

// 캘린더에서 날짜 선택
function selectCalendarDate(date) {
    selectedCalendarDate = date;
    
    // 캘린더 다시 렌더링하여 선택 표시 업데이트
    renderCalendar();
    
    // 예약 목록 다시 렌더링
    renderReservationList();
    
    // 필터 텍스트 업데이트
    updateFilterText();
}

// 특정 날짜에 예약이 있는지 확인
function hasReservationOnDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.some(reservation => 
        reservation.date === dateStr && reservation.status !== 'cancelled'
    );
}

// 통계 업데이트
function updateStatistics() {
    const total = reservations.length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const rejected = reservations.filter(r => r.status === 'rejected').length;
    
    document.getElementById('totalReservations').textContent = total;
    document.getElementById('pendingReservations').textContent = pending;
    document.getElementById('confirmedReservations').textContent = confirmed;
    document.getElementById('rejectedReservations').textContent = rejected;
}

// 예약 목록 렌더링
function renderReservationList() {
    const reservationList = document.getElementById('reservationList');
    
    // 필터링된 예약 목록 생성
    let filteredReservations = [...reservations];
    
    // 카테고리별 필터링
    if (currentCategory !== 'all') {
        filteredReservations = filteredReservations.filter(r => r.status === currentCategory);
    }
    
    // 날짜별 필터링
    if (selectedCalendarDate) {
        const dateStr = selectedCalendarDate.toISOString().split('T')[0];
        filteredReservations = filteredReservations.filter(r => r.date === dateStr);
    }
    
    if (filteredReservations.length === 0) {
        let message = '';
        if (selectedCalendarDate) {
            const dateStr = formatDate(selectedCalendarDate);
            if (currentCategory === 'all') {
                message = `${dateStr}에는 예약이 없습니다.`;
            } else {
                const statusText = getStatusText(currentCategory);
                message = `${dateStr}에는 ${statusText} 예약이 없습니다.`;
            }
        } else {
            if (currentCategory === 'all') {
                message = '아직 상담 예약이 등록되지 않았습니다.';
            } else {
                const statusText = getStatusText(currentCategory);
                message = `${statusText} 예약이 없습니다.`;
            }
        }
        
        reservationList.innerHTML = `
            <div class="no-reservations">
                <h3>📝 예약이 없습니다</h3>
                <p>${message}</p>
            </div>
        `;
        return;
    }
    
    // 최신 예약부터 정렬
    const sortedReservations = filteredReservations.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    reservationList.innerHTML = sortedReservations.map(reservation => `
        <div class="reservation-item" data-id="${reservation.id}">
            <div class="reservation-header">
                <span class="status-${reservation.status}">
                    ${getStatusText(reservation.status)}
                </span>
                <small>${formatDateTime(reservation.createdAt)}</small>
            </div>
            
            <div class="reservation-info">
                <div class="info-item">
                    <span class="info-label">이름</span>
                    <span class="info-value">${reservation.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">연락처</span>
                    <span class="info-value">${reservation.phone}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">예약 날짜</span>
                    <span class="info-value">${formatDate(new Date(reservation.date))}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">예약 시간</span>
                    <span class="info-value">${reservation.time}</span>
                </div>
                ${reservation.memo ? `
                <div class="info-item">
                    <span class="info-label">메모</span>
                    <span class="info-value">${reservation.memo}</span>
                </div>
                ` : ''}
            </div>
            
            ${reservation.status === 'pending' ? `
            <div class="reservation-actions">
                <button class="action-btn confirm-btn" onclick="confirmReservation(${reservation.id})">
                    ✅ 확정
                </button>
                <button class="action-btn reject-btn" onclick="rejectReservation(${reservation.id})">
                    ❌ 거절
                </button>
            </div>
            ` : ''}
        </div>
    `).join('');
}

// 예약 확정
function confirmReservation(id) {
    if (confirm('이 예약을 확정하시겠습니까?')) {
        const reservation = reservations.find(r => r.id === id);
        if (reservation) {
            reservation.status = 'confirmed';
            saveReservations();
            updateStatistics();
            renderReservationList();
            renderCalendar();
            alert('예약이 확정되었습니다.');
        }
    }
}

// 예약 거절
function rejectReservation(id) {
    if (confirm('이 예약을 거절하시겠습니까?')) {
        const reservation = reservations.find(r => r.id === id);
        if (reservation) {
            reservation.status = 'rejected';
            saveReservations();
            updateStatistics();
            renderReservationList();
            renderCalendar();
            alert('예약이 거절되었습니다.');
        }
    }
}

// 예약 데이터 저장
function saveReservations() {
    localStorage.setItem('reservations', JSON.stringify(reservations));
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusMap = {
        'pending': '대기 중',
        'confirmed': '확정됨',
        'rejected': '거절됨',
        'cancelled': '취소됨'
    };
    return statusMap[status] || status;
}

// 날짜 포맷팅
function formatDate(date) {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// 날짜시간 포맷팅
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// 페이지 새로고침 시 데이터 동기화
window.addEventListener('storage', function(e) {
    if (e.key === 'reservations') {
        loadReservations();
        updateStatistics();
        renderReservationList();
        renderCalendar();
    }
});
