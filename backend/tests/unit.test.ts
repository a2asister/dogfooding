import tap from 'tap';
import db from '../src/db';
import { createUser, getUserByEmail, verifyPassword, createTeam, getUserTeams, addTeamMember, getTeamMembers, createShare, getShareByUuid, createPlugin, searchPlugins, installPlugin, getUserPlugins } from '../src/db';
import { fs, type FileSystemContext } from '../src/filesystem';

tap.test('Database - User Operations', async (t) => {
  t.test('createUser - should create a user with email', async (t) => {
    const user = createUser({
      email: 'test@example.com',
      password: 'password123',
    });
    t.ok(user.id, 'User should have an id');
    t.equal(user.email, 'test@example.com');
    t.ok(user.uuid, 'User should have a uuid');
  });

  t.test('createUser - should create a user with phone', async (t) => {
    const user = createUser({
      phone: '13800138000',
      password: 'password123',
    });
    t.ok(user.id, 'User should have an id');
    t.equal(user.phone, '13800138000');
  });

  t.test('createUser - should create a user with username', async (t) => {
    const user = createUser({
      username: 'testuser',
      password: 'password123',
    });
    t.ok(user.id, 'User should have an id');
    t.equal(user.username, 'testuser');
  });

  t.test('getUserByEmail - should get user by email', async (t) => {
    const user = getUserByEmail('test@example.com');
    t.ok(user, 'Should find user');
    t.equal(user?.email, 'test@example.com');
  });

  t.test('verifyPassword - should verify correct password', async (t) => {
    const user = getUserByEmail('test@example.com');
    t.ok(user, 'Should find user');
    if (user) {
      t.ok(verifyPassword(user, 'password123'), 'Password should be valid');
      t.notOk(verifyPassword(user, 'wrongpassword'), 'Wrong password should fail');
    }
  });
});

tap.test('Database - Team Operations', async (t) => {
  const user = createUser({ email: 'team@example.com', password: 'password123' });

  t.test('createTeam - should create a team', async (t) => {
    const team = createTeam('Test Team', 'Test Description', user.id);
    t.ok(team.id, 'Team should have an id');
    t.equal(team.name, 'Test Team');
    t.equal(team.created_by, user.id);
  });

  t.test('getUserTeams - should get user teams', async (t) => {
    const teams = getUserTeams(user.id);
    t.ok(Array.isArray(teams), 'Should return array');
    t.ok(teams.length > 0, 'Should have at least one team');
  });

  t.test('addTeamMember - should add team member', async (t) => {
    const team = createTeam('Member Test Team', '', user.id);
    const user2 = createUser({ email: 'member@example.com', password: 'password123' });
    const result = addTeamMember(team.id, user2.id, 'member');
    t.ok(result, 'Should add member successfully');
  });

  t.test('getTeamMembers - should get team members', async (t) => {
    const team = createTeam('Get Members Team', '', user.id);
    const members = getTeamMembers(team.id);
    t.ok(Array.isArray(members), 'Should return array');
    t.ok(members.length > 0, 'Should have at least one member');
  });
});

tap.test('Database - Share Operations', async (t) => {
  const user = createUser({ email: 'share@example.com', password: 'password123' });
  const context: FileSystemContext = { type: 'user', id: user.id };
  fs.createFile(context, 'test.txt', 'test content');
  const nodeId = fs.getNodeIdByUuid(fs.listDirectory(context)[0].uuid);

  t.test('createShare - should create a share', async (t) => {
    t.ok(nodeId, 'Should have node id');
    if (nodeId) {
      const share = createShare(nodeId, user.id, 'read');
      t.ok(share.id, 'Share should have an id');
      t.equal(share.permission, 'read');
    }
  });

  t.test('getShareByUuid - should get share by uuid', async (t) => {
    t.ok(nodeId, 'Should have node id');
    if (nodeId) {
      const share = createShare(nodeId, user.id, 'edit');
      const found = getShareByUuid(share.uuid);
      t.ok(found, 'Should find share');
      t.equal(found?.uuid, share.uuid);
    }
  });
});

tap.test('Database - Plugin Operations', async (t) => {
  const user = createUser({ email: 'plugin@example.com', password: 'password123' });

  t.test('createPlugin - should create a plugin', async (t) => {
    const plugin = createPlugin({
      name: 'test-plugin',
      description: 'Test plugin',
      version: '1.0.0',
      code: 'console.log("test")',
      createdBy: user.id,
    });
    t.ok(plugin.id, 'Plugin should have an id');
    t.equal(plugin.name, 'test-plugin');
  });

  t.test('searchPlugins - should search plugins', async (t) => {
    const plugins = searchPlugins('test');
    t.ok(Array.isArray(plugins), 'Should return array');
    t.ok(plugins.length > 0, 'Should find plugins');
  });

  t.test('installPlugin - should install a plugin', async (t) => {
    const plugin = createPlugin({
      name: 'install-test',
      version: '1.0.0',
      code: 'console.log("test")',
      createdBy: user.id,
    });
    const result = installPlugin(user.id, plugin.id);
    t.ok(result, 'Should install plugin successfully');
  });

  t.test('getUserPlugins - should get user plugins', async (t) => {
    const plugins = getUserPlugins(user.id);
    t.ok(Array.isArray(plugins), 'Should return array');
  });
});

tap.test('FileSystem - Basic Operations', async (t) => {
  const user = createUser({ email: 'fs@example.com', password: 'password123' });
  const context: FileSystemContext = { type: 'user', id: user.id };

  t.test('listDirectory - should list root directory', async (t) => {
    const items = fs.listDirectory(context);
    t.ok(Array.isArray(items), 'Should return array');
  });

  t.test('createDirectory - should create a directory', async (t) => {
    const result = fs.createDirectory(context, 'testdir');
    t.ok(result, 'Should create directory successfully');
  });

  t.test('createFile - should create a file', async (t) => {
    const result = fs.createFile(context, 'test.txt', 'test content');
    t.ok(result, 'Should create file successfully');
  });

  t.test('readFile - should read file content', async (t) => {
    const content = fs.readFile(context, 'test.txt');
    t.equal(content, 'test content', 'Content should match');
  });

  t.test('exists - should check file existence', async (t) => {
    t.ok(fs.exists(context, 'test.txt'), 'File should exist');
    t.notOk(fs.exists(context, 'nonexistent.txt'), 'File should not exist');
  });

  t.test('getType - should get node type', async (t) => {
    t.equal(fs.getType(context, 'test.txt'), 'file', 'Should be file type');
    t.equal(fs.getType(context, 'testdir'), 'dir', 'Should be dir type');
  });

  t.test('copy - should copy file', async (t) => {
    const result = fs.copy(context, 'test.txt', 'copy.txt');
    t.ok(result, 'Should copy successfully');
    t.equal(fs.readFile(context, 'copy.txt'), 'test content');
  });

  t.test('move - should move file', async (t) => {
    const result = fs.move(context, 'copy.txt', 'moved.txt');
    t.ok(result, 'Should move successfully');
    t.equal(fs.readFile(context, 'moved.txt'), 'test content');
    t.notOk(fs.exists(context, 'copy.txt'));
  });

  t.test('delete - should delete file', async (t) => {
    const result = fs.delete(context, 'moved.txt');
    t.ok(result, 'Should delete successfully');
    t.notOk(fs.exists(context, 'moved.txt'));
  });

  t.test('delete - should delete directory recursively', async (t) => {
    fs.createDirectory(context, 'recursive');
    fs.createFile(context, 'recursive/file.txt', 'content');
    const result = fs.delete(context, 'recursive', true);
    t.ok(result, 'Should delete directory recursively');
    t.notOk(fs.exists(context, 'recursive'));
  });

  t.test('writeFile - should write to file', async (t) => {
    const result = fs.writeFile(context, 'write.txt', 'new content');
    t.ok(result, 'Should write successfully');
    t.equal(fs.readFile(context, 'write.txt'), 'new content');
  });

  t.test('export/import - should export and import data', async (t) => {
    fs.createFile(context, 'export.txt', 'export content');
    const data = fs.exportData(context);
    t.ok(data.nodes, 'Should have nodes in export');

    const user2 = createUser({ email: 'fs2@example.com', password: 'password123' });
    const context2: FileSystemContext = { type: 'user', id: user2.id };
    const result = fs.importData(context2, data);
    t.ok(result, 'Should import successfully');
  });
});

tap.teardown(() => {
  db.close();
});
