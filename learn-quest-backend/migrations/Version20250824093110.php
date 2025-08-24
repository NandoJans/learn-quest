<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250824093110 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE course ADD user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE course ADD CONSTRAINT FK_169E6FB9A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_169E6FB9A76ED395 ON course (user_id)');
        $this->addSql('ALTER TABLE lesson_section DROP FOREIGN KEY FK_lesson_section_lesson');
        $this->addSql('DROP INDEX idx_lesson_section_lesson_id ON lesson_section');
        $this->addSql('CREATE INDEX IDX_D80F2848CDF80196 ON lesson_section (lesson_id)');
        $this->addSql('ALTER TABLE lesson_section ADD CONSTRAINT FK_lesson_section_lesson FOREIGN KEY (lesson_id) REFERENCES lesson (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE lesson_section DROP FOREIGN KEY FK_D80F2848CDF80196');
        $this->addSql('DROP INDEX idx_d80f2848cdf80196 ON lesson_section');
        $this->addSql('CREATE INDEX IDX_lesson_section_lesson_id ON lesson_section (lesson_id)');
        $this->addSql('ALTER TABLE lesson_section ADD CONSTRAINT FK_D80F2848CDF80196 FOREIGN KEY (lesson_id) REFERENCES lesson (id)');
        $this->addSql('ALTER TABLE course DROP FOREIGN KEY FK_169E6FB9A76ED395');
        $this->addSql('DROP INDEX IDX_169E6FB9A76ED395 ON course');
        $this->addSql('ALTER TABLE course DROP user_id');
    }
}
