<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250807180000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create lesson_section table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE lesson_section (id INT AUTO_INCREMENT NOT NULL, lesson_id INT NOT NULL, type VARCHAR(50) NOT NULL, content LONGTEXT DEFAULT NULL, position INT NOT NULL, INDEX IDX_lesson_section_lesson_id (lesson_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE lesson_section ADD CONSTRAINT FK_lesson_section_lesson FOREIGN KEY (lesson_id) REFERENCES lesson (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE lesson_section');
    }
}
