(function() {
    'use strict';

    const AppState = {
        initialized: false,
        eventsBound: false,
        currentUser: null,
        currentClassId: null
    };

    const Storage = {
        KEYS: {
            CURRENT_USER: 'seat_current_user',
            USERS: 'seat_users',
            CLASSES: 'seat_classes',
            STUDENTS: 'seat_students',
            SEATINGS: 'seat_seatings',
            HISTORY: 'seat_history',
            SETTINGS: 'seat_settings',
            TAGS: 'seat_tags'
        },

        init() {
            const users = this.get(this.KEYS.USERS) || [];
            const defaultUsers = [
                { id: '1', username: 'teacher1', password: '123456', name: '张老师', role: 'teacher' },
                { id: '2', username: 'teacher2', password: '123456', name: '李老师', role: 'teacher' }
            ];
            
            defaultUsers.forEach(defaultUser => {
                const exists = users.some(u => u.username === defaultUser.username);
                if (!exists) {
                    users.push(defaultUser);
                } else {
                    const index = users.findIndex(u => u.username === defaultUser.username);
                    users[index] = { ...users[index], ...defaultUser };
                }
            });
            
            this.set(this.KEYS.USERS, users);
            
            if (!this.get(this.KEYS.SETTINGS)) {
                this.set(this.KEYS.SETTINGS, {
                    defaultRows: 6,
                    defaultCols: 8
                });
            }
            if (!this.get(this.KEYS.TAGS)) {
                this.set(this.KEYS.TAGS, [
                    { id: '1', name: '靠窗', color: '#4A90D9' },
                    { id: '2', name: '靠过道', color: '#67C23A' },
                    { id: '3', name: '小组位', color: '#E6A23C' }
                ]);
            }
        },

        get(key) {
            const value = localStorage.getItem(key);
            try {
                return value ? JSON.parse(value) : null;
            } catch {
                return value;
            }
        },

        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },

        remove(key) {
            localStorage.removeItem(key);
        }
    };

    const Toast = {
        container: null,

        init() {
            if (this.container) return;
            this.container = document.getElementById('toast-container');
        },

        show(message, type = 'info', duration = 3000) {
            if (!this.container) {
                this.init();
            }

            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <span class="toast-icon">${icons[type]}</span>
                <span class="toast-message">${message}</span>
            `;

            this.container.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    if (toast.parentNode) {
                        this.container.removeChild(toast);
                    }
                }, 300);
            }, duration);
        }
    };

    const Modal = {
        bindEvents() {
            document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
                btn.addEventListener('click', () => this.closeAll());
            });

            document.querySelectorAll('.modal-overlay').forEach(overlay => {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.closeAll();
                    }
                });
            });
        },

        open(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        },

        close(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
            }
        },

        closeAll() {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    };

    const Auth = {
        bindEvents() {
            const loginForm = document.getElementById('login-form');
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });

            const logoutBtn = document.getElementById('logout-btn');
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        },

        login() {
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;

            const users = Storage.get(Storage.KEYS.USERS) || [];
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                AppState.currentUser = user;
                Storage.set(Storage.KEYS.CURRENT_USER, user);

                if (rememberMe) {
                    Storage.set('seat_remembered', { username: user.username });
                } else {
                    Storage.remove('seat_remembered');
                }

                Toast.show(`欢迎回来，${user.name}！`, 'success');
                this.showMainPage();
            } else {
                Toast.show('账号或密码错误', 'error');
            }
        },

        logout() {
            AppState.currentUser = null;
            AppState.currentClassId = null;
            Storage.remove(Storage.KEYS.CURRENT_USER);
            Storage.remove('seat_current_class');
            this.showLoginPage();
            Toast.show('已退出登录', 'info');
        },

        showLoginPage() {
            const loginPage = document.getElementById('login-page');
            const mainPage = document.getElementById('main-page');

            loginPage.style.display = 'flex';
            loginPage.style.position = 'fixed';
            loginPage.style.top = '0';
            loginPage.style.left = '0';
            loginPage.style.right = '0';
            loginPage.style.bottom = '0';
            loginPage.style.zIndex = '9999';

            mainPage.style.display = 'none';

            document.getElementById('password').value = '';
        },

        showMainPage() {
            const loginPage = document.getElementById('login-page');
            const mainPage = document.getElementById('main-page');

            loginPage.style.display = 'none';
            loginPage.style.position = '';
            loginPage.style.top = '';
            loginPage.style.left = '';
            loginPage.style.right = '';
            loginPage.style.bottom = '';
            loginPage.style.zIndex = '';

            mainPage.style.display = 'block';

            document.getElementById('current-user').textContent = AppState.currentUser?.name || '班主任';

            ClassManager.refresh();
            Seating.refresh();
            StudentManager.refresh();
            HistoryManager.refresh();
            SettingsManager.refresh();
        },

        checkSavedLogin() {
            const savedUser = Storage.get(Storage.KEYS.CURRENT_USER);
            if (savedUser) {
                AppState.currentUser = savedUser;
                this.showMainPage();
                return true;
            }
            return false;
        },

        init() {
            const remembered = Storage.get('seat_remembered');
            if (remembered) {
                document.getElementById('username').value = remembered.username;
                document.getElementById('remember-me').checked = true;
            }

            this.checkSavedLogin();
        }
    };

    const ClassManager = {
        classes: [],

        bindEvents() {
            const classSelect = document.getElementById('current-class-select');
            classSelect.addEventListener('change', (e) => {
                this.setCurrentClass(e.target.value);
            });

            const addClassBtn = document.getElementById('add-class-btn');
            addClassBtn.addEventListener('click', () => {
                this.openAddModal();
            });

            const saveClassBtn = document.getElementById('save-class-btn');
            saveClassBtn.addEventListener('click', () => {
                this.saveClass();
            });
        },

        loadClasses() {
            this.classes = Storage.get(Storage.KEYS.CLASSES) || [];
        },

        saveClasses() {
            Storage.set(Storage.KEYS.CLASSES, this.classes);
        },

        openAddModal(classData = null) {
            const title = document.getElementById('add-class-title');
            const editId = document.getElementById('edit-class-id');

            if (classData) {
                title.textContent = '编辑班级';
                editId.value = classData.id;
                document.getElementById('class-name').value = classData.name;
                document.getElementById('class-grade').value = classData.grade;
                document.getElementById('class-rows').value = classData.rows || 6;
                document.getElementById('class-cols').value = classData.cols || 8;
            } else {
                title.textContent = '新建班级';
                editId.value = '';
                document.getElementById('class-name').value = '';
                document.getElementById('class-grade').value = '一年级';
                document.getElementById('class-rows').value = 6;
                document.getElementById('class-cols').value = 8;
            }

            Modal.open('add-class-modal');
        },

        saveClass() {
            const editId = document.getElementById('edit-class-id').value;
            const name = document.getElementById('class-name').value.trim();
            const grade = document.getElementById('class-grade').value;
            const rows = parseInt(document.getElementById('class-rows').value) || 6;
            const cols = parseInt(document.getElementById('class-cols').value) || 8;

            if (!name) {
                Toast.show('请输入班级名称', 'warning');
                return;
            }

            if (editId) {
                const index = this.classes.findIndex(c => c.id === editId);
                if (index !== -1) {
                    this.classes[index] = { ...this.classes[index], name, grade, rows, cols };
                    Toast.show('班级信息已更新', 'success');
                }
            } else {
                const newClass = {
                    id: Date.now().toString(),
                    name,
                    grade,
                    rows,
                    cols,
                    createdAt: new Date().toISOString()
                };
                this.classes.push(newClass);
                Toast.show('班级创建成功', 'success');
            }

            this.saveClasses();
            this.renderClassSelector();
            this.renderClassesPage();
            Modal.close('add-class-modal');
        },

        deleteClass(classId) {
            if (!confirm('确定要删除该班级吗？相关的学生和座位数据也会被删除。')) {
                return;
            }

            this.classes = this.classes.filter(c => c.id !== classId);
            this.saveClasses();

            const students = Storage.get(Storage.KEYS.STUDENTS) || {};
            delete students[classId];
            Storage.set(Storage.KEYS.STUDENTS, students);

            const seatings = Storage.get(Storage.KEYS.SEATINGS) || {};
            delete seatings[classId];
            Storage.set(Storage.KEYS.SEATINGS, seatings);

            const history = Storage.get(Storage.KEYS.HISTORY) || {};
            delete history[classId];
            Storage.set(Storage.KEYS.HISTORY, history);

            if (AppState.currentClassId === classId) {
                AppState.currentClassId = null;
            }

            this.renderClassSelector();
            this.renderClassesPage();
            Toast.show('班级已删除', 'success');
        },

        setCurrentClass(classId) {
            AppState.currentClassId = classId || null;
            Storage.set('seat_current_class', classId);

            if (classId) {
                Seating.refresh();
                StudentManager.refresh();
                HistoryManager.refresh();
            }
        },

        getCurrentClass() {
            return this.classes.find(c => c.id === AppState.currentClassId);
        },

        renderClassSelector() {
            const select = document.getElementById('current-class-select');
            select.innerHTML = '<option value="">请选择班级</option>';

            this.classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                if (cls.id === AppState.currentClassId) {
                    option.selected = true;
                }
                select.appendChild(option);
            });

            const savedClass = Storage.get('seat_current_class');
            if (savedClass && !AppState.currentClassId) {
                AppState.currentClassId = savedClass;
                select.value = savedClass;
            }
        },

        renderClassesPage() {
            const container = document.getElementById('classes-grid');

            if (this.classes.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">🏫</span>
                        <p>暂无班级，请点击上方按钮创建</p>
                    </div>
                `;
                return;
            }

            const students = Storage.get(Storage.KEYS.STUDENTS) || {};
            const seatings = Storage.get(Storage.KEYS.SEATINGS) || {};

            container.innerHTML = this.classes.map(cls => {
                const classStudents = students[cls.id] || [];
                const classSeating = seatings[cls.id] || {};
                const assignedCount = Object.keys(classSeating).length;

                return `
                    <div class="class-card ${cls.id === AppState.currentClassId ? 'active' : ''}" data-id="${cls.id}">
                        <div class="class-actions">
                            <button class="btn btn-text edit-class" data-id="${cls.id}">✏️</button>
                            <button class="btn btn-text delete-class" data-id="${cls.id}">🗑️</button>
                        </div>
                        <div class="class-name">${cls.name}</div>
                        <div class="class-grade">${cls.grade}</div>
                        <div class="class-stats">
                            <span>👨‍🎓 ${classStudents.length} 名学生</span>
                            <span>🪑 ${assignedCount} 人已入座</span>
                        </div>
                    </div>
                `;
            }).join('');

            container.querySelectorAll('.class-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.edit-class') || e.target.closest('.delete-class')) {
                        return;
                    }
                    const classId = card.dataset.id;
                    document.getElementById('current-class-select').value = classId;
                    this.setCurrentClass(classId);
                    this.renderClassesPage();
                    Nav.switchPage('seating');
                });
            });

            container.querySelectorAll('.edit-class').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const classId = btn.dataset.id;
                    const cls = this.classes.find(c => c.id === classId);
                    if (cls) {
                        this.openAddModal(cls);
                    }
                });
            });

            container.querySelectorAll('.delete-class').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteClass(btn.dataset.id);
                });
            });
        },

        refresh() {
            this.loadClasses();
            this.renderClassSelector();
            this.renderClassesPage();
        }
    };

    const StudentManager = {
        students: [],
        importData: null,

        bindEvents() {
            const addStudentBtn = document.getElementById('add-student-btn');
            addStudentBtn.addEventListener('click', () => {
                this.openAddModal();
            });

            const saveStudentBtn = document.getElementById('save-student-btn');
            saveStudentBtn.addEventListener('click', () => {
                this.saveStudent();
            });

            const studentSearch = document.getElementById('student-search');
            studentSearch.addEventListener('input', (e) => {
                this.filterStudents(e.target.value);
            });

            const importStudentsBtn = document.getElementById('import-students-btn');
            importStudentsBtn.addEventListener('click', () => {
                this.openImportModal();
            });

            this.setupFileUpload();
        },

        setupFileUpload() {
            const uploadArea = document.getElementById('file-upload-area');
            const fileInput = document.getElementById('import-file');

            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragging');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragging');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragging');
                if (e.dataTransfer.files.length > 0) {
                    this.handleFileSelect(e.dataTransfer.files[0]);
                }
            });

            const removeFileBtn = document.querySelector('.remove-file');
            if (removeFileBtn) {
                removeFileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.importData = null;
                    fileInput.value = '';
                    document.getElementById('file-info').style.display = 'none';
                    document.querySelector('.upload-placeholder').style.display = 'block';
                    document.getElementById('preview-area').style.display = 'none';
                    document.getElementById('confirm-import-btn').disabled = true;
                });
            }

            const confirmImportBtn = document.getElementById('confirm-import-btn');
            if (confirmImportBtn) {
                confirmImportBtn.addEventListener('click', () => {
                    this.confirmImport();
                });
            }
        },

        openAddModal(studentData = null) {
            const title = document.getElementById('add-student-title');
            const editId = document.getElementById('edit-student-id');

            if (studentData) {
                title.textContent = '编辑学生';
                editId.value = studentData.id;
                document.getElementById('student-id').value = studentData.studentId || '';
                document.getElementById('student-name').value = studentData.name || '';
                document.getElementById('student-gender').value = studentData.gender || '男';
                document.getElementById('student-height').value = studentData.height || '';
                document.getElementById('student-vision').value = studentData.vision || '正常';
                document.getElementById('student-group').value = studentData.group || '';
            } else {
                title.textContent = '添加学生';
                editId.value = '';
                document.getElementById('student-id').value = '';
                document.getElementById('student-name').value = '';
                document.getElementById('student-gender').value = '男';
                document.getElementById('student-height').value = '';
                document.getElementById('student-vision').value = '正常';
                document.getElementById('student-group').value = '';
            }

            Modal.open('add-student-modal');
        },

        saveStudent() {
            const editId = document.getElementById('edit-student-id').value;
            const studentId = document.getElementById('student-id').value.trim();
            const name = document.getElementById('student-name').value.trim();
            const gender = document.getElementById('student-gender').value;
            const height = document.getElementById('student-height').value ? parseInt(document.getElementById('student-height').value) : null;
            const vision = document.getElementById('student-vision').value;
            const group = document.getElementById('student-group').value.trim();

            if (!studentId || !name) {
                Toast.show('请填写学号和姓名', 'warning');
                return;
            }

            if (editId) {
                const index = this.students.findIndex(s => s.id === editId);
                if (index !== -1) {
                    this.students[index] = {
                        ...this.students[index],
                        studentId,
                        name,
                        gender,
                        height,
                        vision,
                        group
                    };
                    Toast.show('学生信息已更新', 'success');
                }
            } else {
                if (this.students.some(s => s.studentId === studentId)) {
                    Toast.show('该学号已存在', 'warning');
                    return;
                }

                const newStudent = {
                    id: Date.now().toString(),
                    studentId,
                    name,
                    gender,
                    height,
                    vision,
                    group,
                    createdAt: new Date().toISOString()
                };
                this.students.push(newStudent);
                Toast.show('学生添加成功', 'success');
            }

            this.saveStudents();
            this.renderStudentsTable();
            Seating.refresh();
            Modal.close('add-student-modal');
        },

        deleteStudent(studentId) {
            if (!confirm('确定要删除该学生吗？')) {
                return;
            }

            const index = this.students.findIndex(s => s.id === studentId);
            if (index !== -1) {
                this.students.splice(index, 1);

                const seatings = Storage.get(Storage.KEYS.SEATINGS) || {};
                const classSeating = seatings[AppState.currentClassId] || {};
                for (const [key, value] of Object.entries(classSeating)) {
                    if (value === studentId) {
                        delete classSeating[key];
                    }
                }
                seatings[AppState.currentClassId] = classSeating;
                Storage.set(Storage.KEYS.SEATINGS, seatings);

                this.saveStudents();
                this.renderStudentsTable();
                Seating.refresh();
                Toast.show('学生已删除', 'success');
            }
        },

        loadStudents() {
            const allStudents = Storage.get(Storage.KEYS.STUDENTS) || {};
            this.students = allStudents[AppState.currentClassId] || [];
        },

        saveStudents() {
            const allStudents = Storage.get(Storage.KEYS.STUDENTS) || {};
            allStudents[AppState.currentClassId] = this.students;
            Storage.set(Storage.KEYS.STUDENTS, allStudents);
        },

        filterStudents(keyword) {
            const rows = document.querySelectorAll('#students-table-body tr:not(.empty-row)');
            keyword = keyword.toLowerCase();

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(keyword) ? '' : 'none';
            });
        },

        renderStudentsTable() {
            const tbody = document.getElementById('students-table-body');

            if (this.students.length === 0) {
                tbody.innerHTML = `
                    <tr class="empty-row">
                        <td colspan="8" class="empty-cell">暂无学生数据</td>
                    </tr>
                `;
                return;
            }

            const seatings = Storage.get(Storage.KEYS.SEATINGS) || {};
            const classSeating = seatings[AppState.currentClassId] || {};

            const getSeatPosition = (studentId) => {
                for (const [key, value] of Object.entries(classSeating)) {
                    if (value === studentId) {
                        const [row, col] = key.split('-').map(Number);
                        return `第${row + 1}排第${col + 1}座`;
                    }
                }
                return '未分配';
            };

            tbody.innerHTML = this.students.map(student => `
                <tr data-id="${student.id}">
                    <td>${student.studentId}</td>
                    <td>${student.name}</td>
                    <td>${student.gender}</td>
                    <td>${student.height || '-'}</td>
                    <td>${student.vision}</td>
                    <td>${student.group || '-'}</td>
                    <td>${getSeatPosition(student.id)}</td>
                    <td class="actions">
                        <button class="btn btn-secondary edit-student" data-id="${student.id}">编辑</button>
                        <button class="btn btn-danger delete-student" data-id="${student.id}">删除</button>
                    </td>
                </tr>
            `).join('');

            tbody.querySelectorAll('.edit-student').forEach(btn => {
                btn.addEventListener('click', () => {
                    const student = this.students.find(s => s.id === btn.dataset.id);
                    if (student) {
                        this.openAddModal(student);
                    }
                });
            });

            tbody.querySelectorAll('.delete-student').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.deleteStudent(btn.dataset.id);
                });
            });
        },

        openImportModal() {
            this.importData = null;
            document.getElementById('import-file').value = '';
            document.getElementById('file-info').style.display = 'none';
            document.querySelector('.upload-placeholder').style.display = 'block';
            document.getElementById('preview-area').style.display = 'none';
            document.getElementById('confirm-import-btn').disabled = true;
            Modal.open('import-modal');
        },

        handleFileSelect(file) {
            const fileName = file.name.toLowerCase();
            if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
                Toast.show('请上传CSV或Excel文件', 'warning');
                return;
            }

            document.getElementById('file-info').style.display = 'flex';
            document.getElementById('file-info').querySelector('.file-name').textContent = file.name;
            document.querySelector('.upload-placeholder').style.display = 'none';

            const reader = new FileReader();

            if (fileName.endsWith('.csv')) {
                reader.onload = (e) => {
                    this.parseCSV(e.target.result);
                };
                reader.readAsText(file);
            } else {
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    this.parseExcelData(jsonData);
                };
                reader.readAsArrayBuffer(file);
            }
        },

        parseCSV(text) {
            const lines = text.split('\n').filter(line => line.trim());
            const data = lines.map(line => {
                const result = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim());
                return result;
            });

            this.parseExcelData(data);
        },

        parseExcelData(data) {
            if (data.length < 2) {
                Toast.show('文件数据格式不正确', 'error');
                return;
            }

            const headers = data[0];
            const rows = data.slice(1);

            this.importData = rows.map(row => {
                const student = {};
                headers.forEach((header, index) => {
                    const value = row[index] || '';
                    const headerStr = String(header).trim();
                    
                    if (headerStr.includes('学号') || headerStr.includes('studentId') || headerStr.includes('id')) {
                        student.studentId = String(value).trim();
                    } else if (headerStr.includes('姓名') || headerStr.includes('name')) {
                        student.name = String(value).trim();
                    } else if (headerStr.includes('性别') || headerStr.includes('gender')) {
                        student.gender = String(value).trim() || '男';
                    } else if (headerStr.includes('身高') || headerStr.includes('height')) {
                        student.height = parseInt(value) || null;
                    } else if (headerStr.includes('视力') || headerStr.includes('vision')) {
                        student.vision = String(value).trim() || '正常';
                    } else if (headerStr.includes('小组') || headerStr.includes('group')) {
                        student.group = String(value).trim();
                    }
                });
                return student;
            }).filter(s => s.studentId && s.name);

            this.renderImportPreview();
            document.getElementById('preview-area').style.display = 'block';
            document.getElementById('confirm-import-btn').disabled = this.importData.length === 0;
        },

        renderImportPreview() {
            const table = document.getElementById('preview-table');
            const data = this.importData.slice(0, 10);

            let html = '<thead><tr>';
            const headers = ['学号', '姓名', '性别', '身高', '视力', '小组'];
            headers.forEach(h => {
                html += `<th>${h}</th>`;
            });
            html += '</tr></thead><tbody>';

            data.forEach(student => {
                html += `
                    <tr>
                        <td>${student.studentId || '-'}</td>
                        <td>${student.name || '-'}</td>
                        <td>${student.gender || '-'}</td>
                        <td>${student.height || '-'}</td>
                        <td>${student.vision || '-'}</td>
                        <td>${student.group || '-'}</td>
                    </tr>
                `;
            });

            if (this.importData.length > 10) {
                html += `<tr><td colspan="6" style="text-align: center; color: var(--info-color);">... 还有 ${this.importData.length - 10} 条数据</td></tr>`;
            }

            html += '</tbody>';
            table.innerHTML = html;
        },

        confirmImport() {
            if (!this.importData || this.importData.length === 0) {
                Toast.show('没有可导入的数据', 'warning');
                return;
            }

            let imported = 0;
            let skipped = 0;

            this.importData.forEach(student => {
                if (this.students.some(s => s.studentId === student.studentId)) {
                    skipped++;
                    return;
                }

                this.students.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    studentId: student.studentId,
                    name: student.name,
                    gender: student.gender || '男',
                    height: student.height,
                    vision: student.vision || '正常',
                    group: student.group,
                    createdAt: new Date().toISOString()
                });
                imported++;
            });

            this.saveStudents();
            this.renderStudentsTable();
            Seating.refresh();
            Modal.close('import-modal');

            Toast.show(`导入完成：成功 ${imported} 条，跳过 ${skipped} 条已存在数据`, 'success');
        },

        refresh() {
            if (!AppState.currentClassId) {
                return;
            }
            this.loadStudents();
            this.renderStudentsTable();
        }
    };

    const Seating = {
        rows: 6,
        cols: 8,
        aislePosition: 'none',
        seatings: {},

        bindEvents() {
            const applyConfigBtn = document.getElementById('apply-config-btn');
            applyConfigBtn.addEventListener('click', () => {
                this.applyConfig();
            });

            const saveSeatingBtn = document.getElementById('save-seating-btn');
            saveSeatingBtn.addEventListener('click', () => {
                this.saveSeatingLayout();
            });

            const autoSortBtn = document.getElementById('auto-sort-btn');
            autoSortBtn.addEventListener('click', () => {
                Modal.open('auto-sort-modal');
            });

            const confirmSortBtn = document.getElementById('confirm-sort-btn');
            confirmSortBtn.addEventListener('click', () => {
                this.autoSort();
            });

            const exportBtn = document.getElementById('export-btn');
            exportBtn.addEventListener('click', () => {
                this.openExportModal();
            });

            const confirmExportBtn = document.getElementById('confirm-export-btn');
            confirmExportBtn.addEventListener('click', () => {
                this.exportSeating();
            });

            const printBtn = document.getElementById('print-btn');
            printBtn.addEventListener('click', () => {
                this.printSeating();
            });
        },

        loadSeatings() {
            const allSeatings = Storage.get(Storage.KEYS.SEATINGS) || {};
            this.seatings = allSeatings[AppState.currentClassId] || {};
        },

        saveSeatings() {
            const allSeatings = Storage.get(Storage.KEYS.SEATINGS) || {};
            allSeatings[AppState.currentClassId] = this.seatings;
            Storage.set(Storage.KEYS.SEATINGS, allSeatings);
        },

        applyConfig() {
            const rows = parseInt(document.getElementById('row-count').value) || 6;
            const cols = parseInt(document.getElementById('col-count').value) || 8;
            const aislePosition = document.getElementById('aisle-position').value;

            if (rows < 1 || rows > 20 || cols < 1 || cols > 15) {
                Toast.show('行数范围1-20，列数范围1-15', 'warning');
                return;
            }

            if (rows !== this.rows || cols !== this.cols) {
                if (Object.keys(this.seatings).length > 0) {
                    if (!confirm('修改行列数将清空当前座位安排，是否继续？')) {
                        return;
                    }
                    this.seatings = {};
                }
            }

            this.rows = rows;
            this.cols = cols;
            this.aislePosition = aislePosition;

            const cls = ClassManager.getCurrentClass();
            if (cls) {
                cls.rows = rows;
                cls.cols = cols;
                ClassManager.saveClasses();
            }

            this.renderGrid();
            this.saveSeatings();
            Toast.show('配置已应用', 'success');
        },

        getGridTemplateColumns() {
            let cols = [];

            if (this.aislePosition === 'left') {
                cols.push({ type: 'aisle', width: '40px' });
            }

            for (let i = 0; i < this.cols; i++) {
                if (this.aislePosition === 'middle' && i === Math.floor(this.cols / 2)) {
                    cols.push({ type: 'aisle', width: '40px' });
                }
                cols.push({ type: 'seat', width: '80px' });
            }

            if (this.aislePosition === 'right') {
                cols.push({ type: 'aisle', width: '40px' });
            }

            return cols;
        },

        renderGrid() {
            const grid = document.getElementById('seating-grid');
            const students = StudentManager.students;

            const colConfig = this.getGridTemplateColumns();

            grid.style.gridTemplateColumns = colConfig.map(c => c.width).join(' ');
            grid.style.gridTemplateRows = `repeat(${this.rows}, 70px)`;
            grid.innerHTML = '';

            for (let row = 0; row < this.rows; row++) {
                let colIndex = 0;

                if (this.aislePosition === 'left') {
                    const aisle = document.createElement('div');
                    aisle.className = 'aisle';
                    aisle.style.gridColumn = colIndex + 1;
                    aisle.style.gridRow = row + 1;
                    grid.appendChild(aisle);
                    colIndex++;
                }

                for (let col = 0; col < this.cols; col++) {
                    if (this.aislePosition === 'middle' && col === Math.floor(this.cols / 2)) {
                        const aisle = document.createElement('div');
                        aisle.className = 'aisle';
                        aisle.style.gridColumn = colIndex + 1;
                        aisle.style.gridRow = row + 1;
                        grid.appendChild(aisle);
                        colIndex++;
                    }

                    const seat = document.createElement('div');
                    const key = `${row}-${col}`;
                    const studentId = this.seatings[key];
                    const student = students.find(s => s.id === studentId);

                    seat.className = `seat ${student ? 'occupied' : ''}`;
                    seat.dataset.row = row;
                    seat.dataset.col = col;
                    seat.dataset.key = key;
                    seat.draggable = true;
                    seat.style.gridColumn = colIndex + 1;
                    seat.style.gridRow = row + 1;

                    let seatContent = `<span class="seat-position">${row + 1}-${col + 1}</span>`;

                    if (student) {
                        seatContent += `
                            <span class="student-name">${student.name}</span>
                            <span class="student-info">${student.height ? student.height + 'cm' : ''}</span>
                        `;
                        seat.dataset.studentId = studentId;
                    }

                    seat.innerHTML = seatContent;

                    this.setupSeatDragEvents(seat, student);
                    grid.appendChild(seat);
                    colIndex++;
                }

                if (this.aislePosition === 'right') {
                    const aisle = document.createElement('div');
                    aisle.className = 'aisle';
                    aisle.style.gridColumn = colIndex + 1;
                    aisle.style.gridRow = row + 1;
                    grid.appendChild(aisle);
                }
            }
        },

        setupSeatDragEvents(seat, student) {
            seat.addEventListener('dragstart', (e) => {
                if (!student) {
                    e.preventDefault();
                    return;
                }
                seat.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', student.id);
            });

            seat.addEventListener('dragend', () => {
                seat.classList.remove('dragging');
                document.querySelectorAll('.dragging-over').forEach(el => {
                    el.classList.remove('dragging-over');
                });
            });

            seat.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                seat.classList.add('dragging-over');
            });

            seat.addEventListener('dragleave', () => {
                seat.classList.remove('dragging-over');
            });

            seat.addEventListener('drop', (e) => {
                e.preventDefault();
                seat.classList.remove('dragging-over');

                const sourceStudentId = e.dataTransfer.getData('text/plain');
                const targetKey = seat.dataset.key;
                const targetStudentId = this.seatings[targetKey];

                if (sourceStudentId === targetStudentId) {
                    return;
                }

                let sourceKey = null;
                for (const [key, value] of Object.entries(this.seatings)) {
                    if (value === sourceStudentId) {
                        sourceKey = key;
                        break;
                    }
                }

                if (targetStudentId) {
                    if (sourceKey) {
                        this.seatings[sourceKey] = targetStudentId;
                    }
                } else {
                    if (sourceKey) {
                        delete this.seatings[sourceKey];
                    }
                }

                this.seatings[targetKey] = sourceStudentId;

                this.saveSeatings();
                this.renderGrid();
                this.renderUnassignedStudents();
            });

            seat.addEventListener('click', () => {
                if (student) {
                    this.showSeatDetail(seat, student);
                } else {
                    Toast.show('点击未分配座位的学生卡片，拖拽到座位上', 'info');
                }
            });
        },

        showSeatDetail(seat, student) {
            const key = seat.dataset.key;
            const [row, col] = key.split('-').map(Number);

            const body = document.getElementById('seat-detail-body');
            
            const unseatBtnId = 'unseat-btn-' + Date.now();
            const editBtnId = 'edit-student-detail-btn-' + Date.now();
            
            body.innerHTML = `
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color), #6BA8E8); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 600;">
                        ${student.name.charAt(0)}
                    </div>
                    <div>
                        <h4 style="font-size: 20px; margin-bottom: 4px;">${student.name}</h4>
                        <p style="color: var(--text-secondary);">学号：${student.studentId}</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="padding: 12px; background: var(--bg-color); border-radius: var(--radius-sm);">
                        <div style="font-size: 12px; color: var(--info-color); margin-bottom: 4px;">座位位置</div>
                        <div style="font-weight: 600;">第${row + 1}排 第${col + 1}座</div>
                    </div>
                    <div style="padding: 12px; background: var(--bg-color); border-radius: var(--radius-sm);">
                        <div style="font-size: 12px; color: var(--info-color); margin-bottom: 4px;">性别</div>
                        <div style="font-weight: 600;">${student.gender}</div>
                    </div>
                    <div style="padding: 12px; background: var(--bg-color); border-radius: var(--radius-sm);">
                        <div style="font-size: 12px; color: var(--info-color); margin-bottom: 4px;">身高</div>
                        <div style="font-weight: 600;">${student.height ? student.height + ' cm' : '-'}</div>
                    </div>
                    <div style="padding: 12px; background: var(--bg-color); border-radius: var(--radius-sm);">
                        <div style="font-size: 12px; color: var(--info-color); margin-bottom: 4px;">视力情况</div>
                        <div style="font-weight: 600;">${student.vision}</div>
                    </div>
                    <div style="padding: 12px; background: var(--bg-color); border-radius: var(--radius-sm); grid-column: span 2;">
                        <div style="font-size: 12px; color: var(--info-color); margin-bottom: 4px;">学习小组</div>
                        <div style="font-weight: 600;">${student.group || '-'}</div>
                    </div>
                </div>
                <div style="margin-top: 20px; display: flex; gap: 12px;">
                    <button class="btn btn-secondary" id="${unseatBtnId}">移出座位</button>
                    <button class="btn btn-primary" id="${editBtnId}">编辑信息</button>
                </div>
            `;

            Modal.open('seat-detail-modal');

            const unseatBtn = document.getElementById(unseatBtnId);
            if (unseatBtn) {
                unseatBtn.onclick = () => {
                    delete this.seatings[key];
                    this.saveSeatings();
                    this.renderGrid();
                    this.renderUnassignedStudents();
                    Modal.close('seat-detail-modal');
                    Toast.show('已将学生移出座位', 'success');
                };
            }

            const editBtn = document.getElementById(editBtnId);
            if (editBtn) {
                editBtn.onclick = () => {
                    Modal.close('seat-detail-modal');
                    StudentManager.openAddModal(student);
                };
            }
        },

        renderUnassignedStudents() {
            const container = document.getElementById('unassigned-list');
            const students = StudentManager.students;
            const assignedIds = new Set(Object.values(this.seatings));

            const unassigned = students.filter(s => !assignedIds.has(s.id));

            if (unassigned.length === 0) {
                container.innerHTML = '<p class="empty-hint">暂无未分配座位的学生</p>';
                return;
            }

            container.innerHTML = unassigned.map(student => `
                <div class="student-card" draggable="true" data-student-id="${student.id}">
                    <div class="avatar">${student.name.charAt(0)}</div>
                    <div class="info">
                        <span class="name">${student.name}</span>
                        <span class="detail">${student.studentId} ${student.height ? student.height + 'cm' : ''}</span>
                    </div>
                </div>
            `).join('');

            container.querySelectorAll('.student-card').forEach(card => {
                card.addEventListener('dragstart', (e) => {
                    const studentId = card.dataset.studentId;
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', studentId);
                });
            });
        },

        saveSeatingLayout() {
            const beforeSeating = { ...this.seatings };
            this.saveSeatings();

            HistoryManager.addRecord(beforeSeating, this.seatings);

            Toast.show('座位安排已保存', 'success');
        },

        autoSort() {
            const criteria = document.getElementById('sort-criteria').value;
            const direction = document.getElementById('sort-direction').value;

            const students = StudentManager.students;
            const assignedIds = new Set(Object.values(this.seatings));
            const unassigned = students.filter(s => !assignedIds.has(s.id));

            if (unassigned.length === 0) {
                Toast.show('所有学生都已分配座位', 'info');
                Modal.close('auto-sort-modal');
                return;
            }

            const visionOrder = { '高度近视': 0, '中度近视': 1, '轻度近视': 2, '正常': 3 };

            const sorted = [...unassigned].sort((a, b) => {
                switch (criteria) {
                    case 'height':
                        return (a.height || 0) - (b.height || 0);
                    case 'height-desc':
                        return (b.height || 0) - (a.height || 0);
                    case 'vision':
                        return visionOrder[a.vision] - visionOrder[b.vision];
                    default:
                        return 0;
                }
            });

            const emptySeats = [];
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const key = `${row}-${col}`;
                    if (!this.seatings[key]) {
                        emptySeats.push({ key, row, col });
                    }
                }
            }

            if (direction === 'left-to-right') {
                emptySeats.sort((a, b) => {
                    if (a.col !== b.col) return a.col - b.col;
                    return a.row - b.row;
                });
            } else {
                emptySeats.sort((a, b) => {
                    if (a.row !== b.row) return a.row - b.row;
                    return a.col - b.col;
                });
            }

            const beforeSeating = { ...this.seatings };

            sorted.forEach((student, index) => {
                if (index < emptySeats.length) {
                    this.seatings[emptySeats[index].key] = student.id;
                }
            });

            this.saveSeatings();
            this.renderGrid();
            this.renderUnassignedStudents();
            HistoryManager.addRecord(beforeSeating, this.seatings);

            Modal.close('auto-sort-modal');
            Toast.show('自动排序完成', 'success');
        },

        openExportModal() {
            const cls = ClassManager.getCurrentClass();
            document.getElementById('export-filename').value = cls ? `${cls.name}座位表` : '座位表';
            Modal.open('export-modal');
        },

        exportSeating() {
            const type = document.querySelector('input[name="export-type"]:checked').value;
            const filename = document.getElementById('export-filename').value.trim() || '座位表';

            if (type === 'excel') {
                this.exportToExcel(filename);
            } else {
                this.exportToPDF(filename);
            }

            Modal.close('export-modal');
        },

        exportToExcel(filename) {
            const students = StudentManager.students;
            const wb = XLSX.utils.book_new();

            const data = [['座位位置', '学号', '姓名', '性别', '身高', '视力', '学习小组']];

            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const key = `${row}-${col}`;
                    const studentId = this.seatings[key];
                    const student = students.find(s => s.id === studentId);

                    if (student) {
                        data.push([
                            `第${row + 1}排第${col + 1}座`,
                            student.studentId,
                            student.name,
                            student.gender,
                            student.height || '',
                            student.vision,
                            student.group || ''
                        ]);
                    }
                }
            }

            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, '座位表');

            const layoutData = [['座位布局图']];
            layoutData.push([]);

            for (let row = 0; row < this.rows; row++) {
                const rowData = [];
                for (let col = 0; col < this.cols; col++) {
                    const key = `${row}-${col}`;
                    const studentId = this.seatings[key];
                    const student = students.find(s => s.id === studentId);
                    rowData.push(student ? student.name : `(空${row + 1}-${col + 1})`);
                }
                layoutData.push(rowData);
            }

            const ws2 = XLSX.utils.aoa_to_sheet(layoutData);
            XLSX.utils.book_append_sheet(wb, ws2, '座位布局');

            XLSX.writeFile(wb, `${filename}.xlsx`);
            Toast.show('Excel文件已导出', 'success');
        },

        exportToPDF(filename) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const students = StudentManager.students;
            const cls = ClassManager.getCurrentClass();

            doc.setFontSize(20);
            doc.setTextColor(74, 144, 217);
            doc.text(cls ? cls.name : '座位表', 105, 25, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(new Date().toLocaleDateString(), 105, 35, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('座位布局：', 20, 50);

            const cellWidth = 25;
            const cellHeight = 12;
            const startX = 20;
            const startY = 60;

            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const x = startX + col * cellWidth;
                    const y = startY + row * cellHeight;

                    doc.setDrawColor(200, 200, 200);
                    doc.rect(x, y, cellWidth, cellHeight);

                    const key = `${row}-${col}`;
                    const studentId = this.seatings[key];
                    const student = students.find(s => s.id === studentId);

                    if (student) {
                        doc.setFontSize(8);
                        doc.setTextColor(0, 0, 0);
                        doc.text(student.name, x + cellWidth / 2, y + cellHeight / 2 + 2, { align: 'center' });
                    }
                }
            }

            doc.save(`${filename}.pdf`);
            Toast.show('PDF文件已导出', 'success');
        },

        printSeating() {
            window.print();
        },

        refresh() {
            if (!AppState.currentClassId) {
                return;
            }

            const cls = ClassManager.getCurrentClass();
            if (cls) {
                this.rows = cls.rows || 6;
                this.cols = cls.cols || 8;
            }

            const settings = Storage.get(Storage.KEYS.SETTINGS) || {};
            this.rows = this.rows || settings.defaultRows || 6;
            this.cols = this.cols || settings.defaultCols || 8;

            document.getElementById('row-count').value = this.rows;
            document.getElementById('col-count').value = this.cols;

            this.loadSeatings();
            StudentManager.loadStudents();
            this.renderGrid();
            this.renderUnassignedStudents();
        }
    };

    const HistoryManager = {
        records: [],

        bindEvents() {
            const clearHistoryBtn = document.getElementById('clear-history-btn');
            clearHistoryBtn.addEventListener('click', () => {
                if (confirm('确定要清空所有历史记录吗？')) {
                    this.records = [];
                    this.saveRecords();
                    this.renderHistory();
                    Toast.show('历史记录已清空', 'success');
                }
            });
        },

        loadRecords() {
            const allHistory = Storage.get(Storage.KEYS.HISTORY) || {};
            this.records = allHistory[AppState.currentClassId] || [];
        },

        saveRecords() {
            const allHistory = Storage.get(Storage.KEYS.HISTORY) || {};
            allHistory[AppState.currentClassId] = this.records;
            Storage.set(Storage.KEYS.HISTORY, allHistory);
        },

        addRecord(beforeSeating, afterSeating) {
            const record = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                before: { ...beforeSeating },
                after: { ...afterSeating },
                rowCount: Seating.rows,
                colCount: Seating.cols
            };

            this.records.unshift(record);

            if (this.records.length > 50) {
                this.records = this.records.slice(0, 50);
            }

            this.saveRecords();
        },

        restoreRecord(recordId) {
            const record = this.records.find(r => r.id === recordId);
            if (!record) {
                Toast.show('记录不存在', 'error');
                return;
            }

            if (!confirm('确定要恢复该座位安排吗？当前座位安排将被覆盖。')) {
                return;
            }

            Seating.seatings = { ...record.after };
            Seating.rows = record.rowCount;
            Seating.cols = record.colCount;
            Seating.saveSeatings();

            document.getElementById('row-count').value = Seating.rows;
            document.getElementById('col-count').value = Seating.cols;

            Seating.renderGrid();
            Seating.renderUnassignedStudents();

            Toast.show('座位安排已恢复', 'success');
            Nav.switchPage('seating');
        },

        countChanges(before, after) {
            let count = 0;
            const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

            allKeys.forEach(key => {
                if (before[key] !== after[key]) {
                    count++;
                }
            });

            return count;
        },

        renderHistory() {
            const container = document.getElementById('history-list');
            const students = StudentManager.students;

            if (this.records.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">📋</span>
                        <p>暂无座位调整历史记录</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = this.records.map(record => {
                const date = new Date(record.timestamp);
                const timeStr = date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const getStudentName = (id) => {
                    const student = students.find(s => s.id === id);
                    return student ? student.name : '?';
                };

                let previewHtml = '';
                if (record.rowCount && record.colCount) {
                    previewHtml = `<div class="preview-grid" style="grid-template-columns: repeat(${record.colCount}, 40px);">`;
                    for (let row = 0; row < Math.min(record.rowCount, 4); row++) {
                        for (let col = 0; col < Math.min(record.colCount, 8); col++) {
                            const key = `${row}-${col}`;
                            const studentId = record.after[key];
                            const hasStudent = !!studentId;
                            previewHtml += `
                                <div class="preview-seat ${hasStudent ? 'occupied' : ''}">
                                    ${hasStudent ? getStudentName(studentId).charAt(0) : ''}
                                </div>
                            `;
                        }
                    }
                    previewHtml += '</div>';
                }

                const changes = this.countChanges(record.before, record.after);

                return `
                    <div class="history-item" data-id="${record.id}">
                        <div class="history-header">
                            <div class="history-time">🕐 ${timeStr}</div>
                            <div class="history-actions">
                                <span style="color: var(--info-color); font-size: 13px; margin-right: 12px;">
                                    ${changes > 0 ? `调整了 ${changes} 个座位` : '保存当前布局'}
                                </span>
                                <button class="btn btn-secondary restore-btn" data-id="${record.id}">恢复</button>
                            </div>
                        </div>
                        ${previewHtml ? `<div class="history-preview"><h4>布局预览</h4>${previewHtml}</div>` : ''}
                    </div>
                `;
            }).join('');

            container.querySelectorAll('.restore-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.restoreRecord(btn.dataset.id);
                });
            });
        },

        refresh() {
            if (!AppState.currentClassId) {
                return;
            }
            this.loadRecords();
            this.renderHistory();
        }
    };

    const SettingsManager = {
        tags: [],

        bindEvents() {
            const addTagBtn = document.getElementById('add-tag-btn');
            addTagBtn.addEventListener('click', () => {
                this.addTag();
            });

            const saveSettingsBtn = document.getElementById('save-settings-btn');
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        },

        loadTags() {
            this.tags = Storage.get(Storage.KEYS.TAGS) || [];
        },

        saveTags() {
            Storage.set(Storage.KEYS.TAGS, this.tags);
        },

        addTag() {
            const name = document.getElementById('new-tag-name').value.trim();
            const color = document.getElementById('new-tag-color').value;

            if (!name) {
                Toast.show('请输入标签名称', 'warning');
                return;
            }

            if (this.tags.some(t => t.name === name)) {
                Toast.show('该标签已存在', 'warning');
                return;
            }

            this.tags.push({
                id: Date.now().toString(),
                name,
                color
            });

            this.saveTags();
            this.renderTags();

            document.getElementById('new-tag-name').value = '';
            Toast.show('标签添加成功', 'success');
        },

        removeTag(tagId) {
            this.tags = this.tags.filter(t => t.id !== tagId);
            this.saveTags();
            this.renderTags();
            Toast.show('标签已删除', 'success');
        },

        renderTags() {
            const container = document.getElementById('tags-list');

            if (this.tags.length === 0) {
                container.innerHTML = '<p class="empty-hint">暂无自定义标签</p>';
                return;
            }

            container.innerHTML = this.tags.map(tag => `
                <div class="tag-item" style="background-color: ${tag.color};">
                    <span>${tag.name}</span>
                    <button class="remove-tag" data-id="${tag.id}">×</button>
                </div>
            `).join('');

            container.querySelectorAll('.remove-tag').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.removeTag(btn.dataset.id);
                });
            });
        },

        saveSettings() {
            const defaultRows = parseInt(document.getElementById('default-rows').value) || 6;
            const defaultCols = parseInt(document.getElementById('default-cols').value) || 8;

            if (defaultRows < 1 || defaultRows > 20 || defaultCols < 1 || defaultCols > 15) {
                Toast.show('行数范围1-20，列数范围1-15', 'warning');
                return;
            }

            Storage.set(Storage.KEYS.SETTINGS, {
                defaultRows,
                defaultCols
            });

            Toast.show('设置已保存', 'success');
        },

        refresh() {
            this.loadTags();
            this.renderTags();

            const settings = Storage.get(Storage.KEYS.SETTINGS) || {};
            document.getElementById('default-rows').value = settings.defaultRows || 6;
            document.getElementById('default-cols').value = settings.defaultCols || 8;
        }
    };

    const Nav = {
        bindEvents() {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    const page = item.dataset.page;
                    this.switchPage(page);

                    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                });
            });
        },

        switchPage(pageName) {
            document.querySelectorAll('.content-page').forEach(page => {
                page.classList.remove('active');
            });

            const targetPage = document.getElementById(`page-${pageName}`);
            if (targetPage) {
                targetPage.classList.add('active');
            }

            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.page === pageName);
            });

            switch (pageName) {
                case 'seating':
                    Seating.refresh();
                    break;
                case 'students':
                    StudentManager.refresh();
                    break;
                case 'history':
                    HistoryManager.refresh();
                    break;
                case 'classes':
                    ClassManager.renderClassesPage();
                    break;
                case 'settings':
                    SettingsManager.refresh();
                    break;
            }
        }
    };

    const App = {
        start() {
            if (AppState.initialized) {
                return;
            }

            Storage.init();
            Toast.init();

            this.bindAllEvents();

            Auth.init();

            AppState.initialized = true;
        },

        bindAllEvents() {
            if (AppState.eventsBound) {
                return;
            }

            Modal.bindEvents();
            Auth.bindEvents();
            ClassManager.bindEvents();
            StudentManager.bindEvents();
            Seating.bindEvents();
            HistoryManager.bindEvents();
            SettingsManager.bindEvents();
            Nav.bindEvents();

            AppState.eventsBound = true;
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        App.start();
    });

})();
