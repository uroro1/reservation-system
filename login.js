// 관리자 로그인 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorModal = document.getElementById('loginErrorModal');
    const errorMessage = document.getElementById('errorMessage');

    // 로그인 폼 제출 이벤트
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = document.getElementById('password').value.trim();
        
        if (!password) {
            showError('비밀번호를 입력해주세요.');
            return;
        }
        
        // 로그인 검증
        if (validateLogin(password)) {
            // 로그인 성공
            loginSuccess();
        } else {
            // 로그인 실패
            showError('비밀번호가 올바르지 않습니다.');
        }
    });

    // 로그인 검증 함수
    function validateLogin(password) {
        // 관리자 비밀번호 (실제 운영 시에는 서버에서 검증해야 함)
        const adminPassword = '1234';
        
        return password === adminPassword;
    }

    // 로그인 성공 처리
    function loginSuccess() {
        // 로그인 상태 저장
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', '관리자');
        localStorage.setItem('loginTime', new Date().toISOString());
        
        // 관리자 페이지로 이동
        window.location.href = 'admin.html';
    }

    // 에러 모달 표시
    function showError(message) {
        errorMessage.textContent = message;
        errorModal.style.display = 'block';
    }

    // 에러 모달 닫기
    window.closeErrorModal = function() {
        errorModal.style.display = 'none';
    };

    // 모달 외부 클릭 시 닫기
    window.onclick = function(event) {
        if (event.target === errorModal) {
            closeErrorModal();
        }
    };

    // Enter 키로 로그인
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});
