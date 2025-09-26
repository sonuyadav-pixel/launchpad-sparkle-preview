import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Building, GraduationCap, Award, Users } from 'lucide-react';

interface ResumeTemplateProps {
  parsedData: any;
}

export const ResumeTemplate = ({ parsedData }: ResumeTemplateProps) => {
  const data = parsedData.parsed_data || parsedData;

  // Extract personal information
  const personalInfo = data.personal_info || {};
  const contact = data.contact || {};
  const education = data.education || [];
  const experience = data.experience || data.work_experience || [];
  const skills = data.skills || [];
  const certifications = data.certifications || [];
  const languages = data.languages || [];

  return (
    <div className="max-w-4xl mx-auto bg-background border rounded-xl shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-secondary p-8 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {personalInfo.name || contact.name || 'Professional Resume'}
            </h1>
            <p className="text-primary-foreground/90 text-lg">
              {personalInfo.title || personalInfo.position || 'Professional'}
            </p>
          </div>
          <div className="text-right space-y-1 text-sm">
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{contact.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Summary/Objective */}
        {(personalInfo.summary || personalInfo.objective) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Professional Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {personalInfo.summary || personalInfo.objective}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {experience.map((job: any, index: number) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {job.position || job.title || job.job_title}
                      </h3>
                      <p className="text-primary font-medium">
                        {job.company || job.organization}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {job.start_date || job.from} - {job.end_date || job.to || 'Present'}
                        </span>
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-muted-foreground">{job.description}</p>
                  )}
                  {job.responsibilities && Array.isArray(job.responsibilities) && (
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {job.responsibilities.map((resp: string, idx: number) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  )}
                  {index < experience.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu: any, index: number) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {edu.degree || edu.qualification}
                    </h3>
                    <p className="text-primary">{edu.institution || edu.school}</p>
                    {edu.field_of_study && (
                      <p className="text-muted-foreground">{edu.field_of_study}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {edu.start_date || edu.from} - {edu.end_date || edu.to || 'Present'}
                      </span>
                    </div>
                    {edu.gpa && (
                      <p className="mt-1">GPA: {edu.gpa}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Skills */}
          {skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string | any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {typeof skill === 'string' ? skill : skill.name || skill.skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {certifications.map((cert: any, index: number) => (
                  <div key={index}>
                    <h4 className="font-medium">
                      {cert.name || cert.certification}
                    </h4>
                    {cert.issuer && (
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    )}
                    {cert.date && (
                      <p className="text-sm text-muted-foreground">{cert.date}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {languages.map((lang: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>{typeof lang === 'string' ? lang : lang.language}</span>
                      {lang.proficiency && (
                        <Badge variant="outline">{lang.proficiency}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};