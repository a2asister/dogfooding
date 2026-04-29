import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Select,
  Tag,
  Space,
  Empty,
  InputNumber,
  message,
  Popconfirm,
  Upload,
} from 'antd';
import {
  ReloadOutlined,
  SaveOutlined,
  ImportOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { teacherApi } from '@/services';
import type { TeacherCourse, CourseSelectionWithStudent } from '@/services/teacher';
import type { User } from '@/types';
import * as XLSX from 'xlsx';

const { Option } = Select;

const GradeEntry: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<CourseSelectionWithStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [editScores, setEditScores] = useState<Record<string, number | null>>({});

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await teacherApi.getMyCourses();
      if (res.success && res.data) {
        setCourses(res.data.rows || []);
      }
    } catch (error) {
      console.error(error);
      message.error('获取课程列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedCourse) return;
    setStudentsLoading(true);
    try {
      const res = await teacherApi.getCourseStudents(selectedCourse);
      if (res.success) {
        const data = res.data || [];
        setStudents(data);
        const initialScores: Record<string, number | null> = {};
        data.forEach((item: CourseSelectionWithStudent) => {
          initialScores[item.id] = item.score ?? null;
        });
        setEditScores(initialScores);
      }
    } catch (error) {
      console.error(error);
      message.error('获取选课学生列表失败');
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
    }
  }, [selectedCourse]);

  const handleScoreChange = (selectionId: string, value: number | null) => {
    setEditScores((prev) => ({
      ...prev,
      [selectionId]: value,
    }));
  };

  const handleSaveScore = async (selectionId: string) => {
    const score = editScores[selectionId];
    if (score === null || score === undefined) {
      message.warning('请输入成绩');
      return;
    }
    if (score < 0 || score > 100) {
      message.warning('成绩必须在0-100之间');
      return;
    }
    try {
      const res = await teacherApi.updateScore(selectionId, { score });
      if (res.success) {
        message.success('成绩保存成功');
        fetchStudents();
      }
    } catch (error) {
      console.error(error);
      message.error('成绩保存失败');
    }
  };

  const handleBatchSave = async () => {
    const updates: Array<{ selectionId: string; score: number }> = [];
    let hasError = false;

    Object.entries(editScores).forEach(([selectionId, score]) => {
      if (score !== null && score !== undefined) {
        if (score < 0 || score > 100) {
          hasError = true;
          return;
        }
        updates.push({ selectionId, score });
      }
    });

    if (hasError) {
      message.warning('存在无效成绩（必须在0-100之间）');
      return;
    }

    if (updates.length === 0) {
      message.warning('没有需要保存的成绩');
      return;
    }

    try {
      await Promise.all(
        updates.map((item) => teacherApi.updateScore(item.selectionId, { score: item.score }))
      );
      message.success(`已保存 ${updates.length} 条成绩`);
      fetchStudents();
    } catch (error) {
      console.error(error);
      message.error('批量保存失败');
    }
  };

  const handleExportTemplate = () => {
    const course = courses.find((c) => c.id === selectedCourse);
    const exportData = students.map((item, index) => {
      const student = item.student as User | undefined;
      return {
        序号: index + 1,
        学号: student?.studentNo || student?.studentId || '-',
        姓名: student?.name || '-',
        专业: student?.major || '-',
        成绩: item.score ?? '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '成绩表');
    XLSX.writeFile(workbook, `${course?.name || '课程'}_成绩表.xlsx`);
    message.success('导出成功');
  };

  const handleImportScore = (info: any) => {
    const { file } = info;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const scoreMap: Record<string, number> = {};
        const studentIdToName: Record<string, string> = {};

        students.forEach((item) => {
          const student = item.student as User | undefined;
          const studentId = student?.studentNo || student?.studentId;
          if (studentId) {
            studentIdToName[studentId] = item.id;
          }
        });

        jsonData.forEach((row: any) => {
          const studentId = String(row['学号'] || row['学生ID'] || '');
          const scoreValue = row['成绩'];

          if (studentId && scoreValue !== undefined && scoreValue !== null && scoreValue !== '') {
            const selectionId = studentIdToName[studentId];
            if (selectionId) {
              const score = Number(scoreValue);
              if (!isNaN(score) && score >= 0 && score <= 100) {
                scoreMap[selectionId] = score;
              }
            }
          }
        });

        if (Object.keys(scoreMap).length > 0) {
          setEditScores((prev) => ({
            ...prev,
            ...scoreMap,
          }));
          message.success(`已导入 ${Object.keys(scoreMap).length} 条成绩，请点击\"批量保存\"确认`);
        } else {
          message.warning('未找到有效的成绩数据');
        }
      } catch (error) {
        console.error(error);
        message.error('导入失败，请检查文件格式');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const columns: ColumnsType<CourseSelectionWithStudent> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: CourseSelectionWithStudent, index: number) => index + 1,
    },
    {
      title: '学号',
      dataIndex: ['student', 'studentNo'],
      key: 'studentNo',
      width: 120,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        const student = record.student;
        if ('username' in (student || {})) {
          return (student as User)?.studentNo || (student as User)?.studentId || '-';
        }
        return student?.studentNo || '-';
      },
    },
    {
      title: '姓名',
      dataIndex: ['student', 'name'],
      key: 'name',
      width: 100,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        return record.student?.name || '-';
      },
    },
    {
      title: '性别',
      dataIndex: ['student', 'gender'],
      key: 'gender',
      width: 60,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        const student = record.student;
        const genderMap: Record<string, string> = { male: '男', female: '女' };
        if ('username' in (student || {})) {
          return genderMap[(student as User)?.gender || ''] || '-';
        }
        return '-';
      },
    },
    {
      title: '专业',
      dataIndex: ['student', 'major'],
      key: 'major',
      width: 150,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        const student = record.student;
        if ('username' in (student || {})) {
          return (student as User)?.major || '-';
        }
        return '-';
      },
    },
    {
      title: '年级',
      dataIndex: ['student', 'gradeId'],
      key: 'grade',
      width: 100,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        const student = record.student;
        if ('username' in (student || {})) {
          return (student as User)?.grade?.name || student?.grade?.name || '-';
        }
        return student?.grade?.name || '-';
      },
    },
    {
      title: '班级',
      dataIndex: ['student', 'classId'],
      key: 'class',
      width: 100,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        const student = record.student;
        if ('username' in (student || {})) {
          return (student as User)?.class?.name || student?.class?.name || '-';
        }
        return student?.class?.name || '-';
      },
    },
    {
      title: '成绩',
      key: 'score',
      width: 150,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        const currentScore = editScores[record.id];
        const originalScore = record.score;
        const hasChanged = currentScore !== originalScore;

        return (
          <Space>
            <InputNumber
              min={0}
              max={100}
              precision={0}
              placeholder="请输入"
              style={{ width: 100 }}
              value={currentScore}
              onChange={(value) => handleScoreChange(record.id, value)}
            />
            {hasChanged && <Tag color="orange">已修改</Tag>}
          </Space>
        );
      },
    },
    {
      title: '原成绩',
      dataIndex: 'score',
      key: 'originalScore',
      width: 80,
      render: (score: number | null | undefined) => {
        if (score === null || score === undefined) {
          return <Tag color="default">未录入</Tag>;
        }
        return (
          <Tag color={score >= 60 ? 'green' : 'red'}>
            {score}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: CourseSelectionWithStudent) => (
        <Popconfirm
          title="确定保存此成绩吗？"
          onConfirm={() => handleSaveScore(record.id)}
        >
          <Button type="link" size="small" icon={<SaveOutlined />}>
            保存
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const hasUnsavedChanges = students.some(
    (item) => editScores[item.id] !== item.score
  );

  return (
    <div className="page-container">
      <Card className="filter-card">
        <Space wrap>
          <Select
            placeholder="选择课程"
            style={{ width: 300 }}
            value={selectedCourse || undefined}
            onChange={setSelectedCourse}
            loading={loading}
          >
            {courses.map((course) => (
              <Option key={course.id} value={course.id}>
                {course.name} ({course.code}) - {course.enrolledCount ?? course.currentStudents ?? 0}人
              </Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchStudents}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleBatchSave}
            disabled={!hasUnsavedChanges}
          >
            批量保存
          </Button>
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            onChange={handleImportScore}
          >
            <Button icon={<ImportOutlined />}>导入成绩</Button>
          </Upload>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExportTemplate}
            disabled={!selectedCourse}
          >
            导出成绩
          </Button>
        </Space>
        {hasUnsavedChanges && (
          <div style={{ marginTop: 12 }}>
            <Tag color="warning">
              注意：存在未保存的修改，请点击\"批量保存\"确认修改
            </Tag>
          </div>
        )}
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={studentsLoading}
          locale={{
            emptyText: selectedCourse ? (
              <Empty description="暂无选课学生" />
            ) : (
              <Empty description="请先选择课程" />
            ),
          }}
          scroll={{ x: 1100 }}
        />
      </Card>
    </div>
  );
};

export default GradeEntry;
