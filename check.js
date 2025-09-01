// 예약확인 페이지 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const searchName = document.getElementById('searchName');
    const searchPhone = document.getElementById('searchPhone');
    const resultSection = document.getElementById('resultSection');
    const reservationDetails = document.getElementById('reservationDetails');
    // editBtn과 cancelBtn은 동적으로 생성되므로 여기서 참조하지 않음
    const editSection = document.getElementById('editSection');
    const editForm = document.getElementById('editForm');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    let currentReservation = null;
    let allFoundReservations = [];

    // 예약 찾기
    searchBtn.addEventListener('click', function() {
        const name = searchName.value.trim();
        const phone = searchPhone.value.trim();

        if (!name && !phone) {
            alert('이름 또는 연락처를 입력해주세요.');
            return;
        }

        console.log('검색 시작:', { name, phone });

        // Local Storage에서 예약 찾기
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        console.log('전체 예약:', reservations); // 디버깅용
        
        // 해당하는 모든 예약 찾기
        allFoundReservations = reservations.filter(reservation => {
            const nameMatch = name && reservation.name === name;
            const phoneMatch = phone && reservation.phone === phone;
            console.log('검색 조건:', { name, phone, reservation: reservation.name, reservationPhone: reservation.phone }); // 디버깅용
            return nameMatch || phoneMatch;
        });

        console.log('찾은 예약:', allFoundReservations);

        if (allFoundReservations.length > 0) {
            displayAllReservations(allFoundReservations);
            resultSection.style.display = 'block';
            editSection.style.display = 'none';
        } else {
            alert('해당하는 예약을 찾을 수 없습니다.');
            resultSection.style.display = 'none';
        }
    });

    // 모든 예약 표시
    function displayAllReservations(reservations) {
        let html = '';
        
        if (reservations.length === 1) {
            // 예약이 하나뿐인 경우
            currentReservation = reservations[0];
            html = createReservationHTML(reservations[0], true);
        } else {
            // 예약이 여러 개인 경우
            html = '<div class="multiple-reservations">';
            html += `<h3>📋 총 ${reservations.length}개의 예약을 찾았습니다</h3>`;
            
            reservations.forEach((reservation, index) => {
                html += createReservationHTML(reservation, false, index);
            });
            
            html += '</div>';
        }
        
        reservationDetails.innerHTML = html;
        
        // 여러 예약이 있는 경우 각각에 대한 액션 버튼 추가
        if (reservations.length > 1) {
            addMultipleReservationActions(reservations);
        }
    }

    // 개별 예약 HTML 생성
    function createReservationHTML(reservation, isSingle, index = 0) {
        console.log('표시할 예약:', reservation); // 디버깅용
        
        // 날짜 처리 (ISO 문자열 또는 Date 객체 모두 지원)
        let displayDate;
        if (typeof reservation.date === 'string') {
            displayDate = new Date(reservation.date);
        } else {
            displayDate = reservation.date;
        }
        
        // 시간 필드 처리 (time 또는 timeSlot)
        const timeSlot = reservation.time || reservation.timeSlot || '시간 정보 없음';
        
        const reservationId = isSingle ? 'current-reservation' : `reservation-${index}`;
        
        return `
            <div class="reservation-item ${reservationId}" data-reservation-index="${index}">
                <div class="reservation-header">
                    <h4>📅 예약 ${index + 1}</h4>
                    <span class="status-badge status-${reservation.status || 'pending'}">${getStatusText(reservation.status)}</span>
                </div>
                <div class="reservation-content">
                    <div class="detail-item">
                        <strong>📅 예약 날짜:</strong> ${displayDate.getFullYear()}년 ${displayDate.getMonth() + 1}월 ${displayDate.getDate()}일
                    </div>
                    <div class="detail-item">
                        <strong>⏰ 예약 시간:</strong> ${timeSlot}
                    </div>
                    <div class="detail-item">
                        <strong>👤 예약자:</strong> ${reservation.name}
                    </div>
                    <div class="detail-item">
                        <strong>📞 연락처:</strong> ${reservation.phone}
                    </div>
                    <div class="detail-item">
                        <strong>📝 메모:</strong> ${reservation.memo || '없음'}
                    </div>
                    <div class="detail-item">
                        <strong>🆔 예약 ID:</strong> ${reservation.id || '없음'}
                    </div>
                </div>
                ${isSingle ? `
                <div class="action-buttons">
                    <button type="button" class="edit-btn" onclick="editReservation(${index})">✏️ 예약 수정</button>
                    <button type="button" class="cancel-btn" onclick="cancelReservation(${index})">❌ 예약 취소</button>
                </div>
                ` : `
                <div class="action-buttons">
                    <button type="button" class="select-btn" onclick="selectReservation(${index})">✅ 이 예약 선택</button>
                </div>
                `}
            </div>
        `;
    }

    // 여러 예약에 대한 액션 버튼 추가
    function addMultipleReservationActions(reservations) {
        // 기존 액션 버튼 제거
        const existingActions = document.querySelector('.action-buttons');
        if (existingActions) {
            existingActions.remove();
        }
    }

    // 예약 선택 (여러 예약 중 하나 선택)
    window.selectReservation = function(index) {
        currentReservation = allFoundReservations[index];
        displayAllReservations([currentReservation]);
    };

    // 예약 수정 (전역 함수로 만들기)
    window.editReservation = function(index) {
        if (allFoundReservations.length > 1) {
            currentReservation = allFoundReservations[index];
        }
        
        if (!currentReservation) return;
        
        // 수정 폼에 현재 값 채우기
        document.getElementById('editName').value = currentReservation.name;
        document.getElementById('editPhone').value = currentReservation.phone;
        document.getElementById('editMemo').value = currentReservation.memo || '';
        
        resultSection.style.display = 'none';
        editSection.style.display = 'block';
    };

    // 수정 취소 버튼
    cancelEditBtn.addEventListener('click', function() {
        editSection.style.display = 'none';
        resultSection.style.display = 'block';
    });

    // 수정 폼 제출
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentReservation) return;

        const updatedReservation = {
            ...currentReservation,
            name: document.getElementById('editName').value.trim(),
            phone: document.getElementById('editPhone').value.trim(),
            memo: document.getElementById('editMemo').value.trim()
        };

        // Local Storage 업데이트
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        const index = reservations.findIndex(r => r.id === currentReservation.id);

        if (index !== -1) {
            reservations[index] = updatedReservation;
            localStorage.setItem('reservations', JSON.stringify(reservations));
            currentReservation = updatedReservation;
            
            // allFoundReservations도 업데이트
            const foundIndex = allFoundReservations.findIndex(r => r.id === currentReservation.id);
            if (foundIndex !== -1) {
                allFoundReservations[foundIndex] = updatedReservation;
            }
            
            alert('예약이 성공적으로 수정되었습니다.');
            editSection.style.display = 'none';
            resultSection.style.display = 'block';
            displayAllReservations(allFoundReservations);
        }
    });

    // 예약 취소 (전역 함수로 만들기)
    window.cancelReservation = function(index) {
        if (allFoundReservations.length > 1) {
            currentReservation = allFoundReservations[index];
        }
        
        if (!currentReservation) return;
        
        showConfirmModal('정말로 이 예약을 취소하시겠습니까?', function() {
            cancelReservationAction();
        });
    };

    // 예약 취소 실행
    function cancelReservationAction() {
        if (!currentReservation) return;

        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        const index = reservations.findIndex(r => r.id === currentReservation.id);

        if (index !== -1) {
            // 예약을 삭제하지 않고 상태만 변경
            reservations[index].status = 'cancelled';
            localStorage.setItem('reservations', JSON.stringify(reservations));
            
            // allFoundReservations도 업데이트
            const foundIndex = allFoundReservations.findIndex(r => r.id === currentReservation.id);
            if (foundIndex !== -1) {
                allFoundReservations[foundIndex].status = 'cancelled';
            }
            
            alert('예약이 취소되었습니다.');
            displayAllReservations(allFoundReservations);
        }
    }

    // 상태 텍스트 변환
    function getStatusText(status) {
        switch(status) {
            case 'confirmed': return '확정됨';
            case 'rejected': return '거절됨';
            case 'cancelled': return '취소됨';
            default: return '대기중';
        }
    }

    // 확인 모달 표시
    function showConfirmModal(message, onConfirm) {
        confirmMessage.textContent = message;
        confirmModal.style.display = 'block';
        
        confirmYes.onclick = function() {
            confirmModal.style.display = 'none';
            onConfirm();
        };
        
        confirmNo.onclick = function() {
            confirmModal.style.display = 'none';
        };
    }

    // 모달 외부 클릭 시 닫기
    window.onclick = function(event) {
        if (event.target === confirmModal) {
            confirmModal.style.display = 'none';
        }
    };

    // Enter 키로 검색
    searchName.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchBtn.click();
    });
    
    searchPhone.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchBtn.click();
    });
});