import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { Tab, TabList, TabPanel, TabContext } from '@mui/material';
import { Button } from '@mui/material';
import { AlertCircle, CheckCircle, Visibility, Download, Calendar, Festival, Image, Articles } from '@mui/icons-material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState('members');
  const [members, setMembers] = useState<any[]>([]);
  const [seva, setSeva] = useState<any[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/members')
      .then(r => r.json())
      .then(setMembers)
      .catch(console.error);
    fetch('/api/admin/seva')
      .then(r => r.json())
      .then(setSeva)
      .catch(console.error);
    fetch('/api/admin/uploads')
      .then(r => r.json())
      .then(setUploads)
      .catch(console.error);
    setLoading(false);
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <nav className="flex gap-4">
          <Button onClick={() => setSection('members')}>Members</Button>
          <Button onClick={() => setSection('seva')}>Seva</Button>
          <Button onClick={() => setSection('uploads')}>Uploads</Button>
        </nav>
      </div>

      <TabList className="hidden md:flex">
        <Tab>Members</Tab>
        <Tab>Seva</Tab>
        <Tab>Uploads</Tab>
      </TabList>

      <TabPanel value={section} onValueChange={setSection}>
        {section === 'members' && (
          <Card className="mb-6">
            <CardHeader>
              <Typography className="text-xl font-bold">Membership Submissions</Typography>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading members...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4">Membership Type</th>
                        <th className="py-3 px-4">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m: any) => (
                        <tr key={m.id} className="border-b">
                          <td className="py-3 px-4">{m.full_name}</td>
                          <td className="py-3 px-4">{m.email}</td>
                          <td className="py-3 px-4">{m.mobile}</td>
                          <td className="py-3 px-4">{m.membership_type}</td>
                          <td className="py-3 px-4">{m.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {section === 'seva' && (
          <Card className="mb-6">
            <CardHeader>
              <Typography className="text-xl font-bold">Seva Submissions</Typography>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading seva...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Seva Type</th>
                        <th className="py-3 px-4">Preferred Date</th>
                        <th className="py-3 px-4">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seva.map((s: any) => (
                        <tr key={s.id} className="border-b">
                          <td className="py-3 px-4">{s.name}</td>
                          <td className="py-3 px-4">{s.seva_type}</td>
                          <td className="py-3 px-4">{s.preferred_date}</td>
                          <td className="py-3 px-4">{s.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {section === 'uploads' && (
          <Card>
            <CardHeader>
              <Typography className="text-xl font-bold">Uploaded Files</Typography>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading uploads...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="py-3 px-4">Filename</th>
                        <th className="py-3 px-4">Original Name</th>
                        <th className="py-3 px_4">Size</th>
                        <th className="py-3 px-4">Uploaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploads.map((u: any) => (
                        <tr key={u.id} className="border-b">
                          <td className="py-3 px-4">{u.stored_name}</td>
                          <td className="py-3 px-4">{u.original_name}</td>
                          <td className="py-3 px-4">{u.size_bytes}</td>
                          <td className="py-3 px-4">{u.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </TabPanel>
    </div>
  );
};

export default Dashboard;